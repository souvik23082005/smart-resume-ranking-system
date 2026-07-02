import os
import uuid
import json
from datetime import datetime
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv

load_dotenv(override=True)

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"])

# MySQL connection pool
db_config = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", "www.tr.com"),
    "database": os.getenv("MYSQL_DATABASE", "resume_ranking"),
}

# Add SSL config if connecting to a cloud database that requires it (like TiDB)
if os.getenv("MYSQL_HOST") and "tidbcloud" in os.getenv("MYSQL_HOST"):
    db_config["ssl_verify_cert"] = True
    db_config["ssl_verify_identity"] = True
    if os.getenv("MYSQL_SSL_CA"):
        db_config["ssl_ca"] = os.getenv("MYSQL_SSL_CA")

pool = pooling.MySQLConnectionPool(
    pool_name="recruitrank_pool",
    pool_size=5,
    **db_config
)


def get_db():
    return pool.get_connection()


def gen_id():
    return str(uuid.uuid4())


def row_to_dict(cursor, row):
    columns = [desc[0] for desc in cursor.description]
    d = {}
    for col, val in zip(columns, row):
        if isinstance(val, datetime):
            d[col] = val.isoformat()
        elif isinstance(val, bytes):
            d[col] = val.decode("utf-8")
        else:
            d[col] = val
    return d


# ─── JOB DESCRIPTIONS ───────────────────────────────────────────────

@app.route("/api/job-descriptions", methods=["POST"])
def create_jd():
    body = request.json
    jd_id = gen_id()
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO job_descriptions
               (id, title, required_education, required_experience_years,
                required_location, industry, notice_period_days, raw_text, source)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                jd_id,
                body.get("title"),
                body.get("required_education"),
                body.get("required_experience_years"),
                body.get("required_location"),
                body.get("industry"),
                body.get("notice_period_days"),
                body.get("raw_text"),
                body.get("source", "manual"),
            ),
        )
        conn.commit()
        cur.execute("SELECT * FROM job_descriptions WHERE id = %s", (jd_id,))
        row = cur.fetchone()
        return jsonify(row_to_dict(cur, row)), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/job-descriptions/<jd_id>", methods=["GET"])
def get_jd(jd_id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM job_descriptions WHERE id = %s", (jd_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Not found"}), 404
        return jsonify(row_to_dict(cur, row))
    finally:
        cur.close()
        conn.close()


# ─── RESUMES ─────────────────────────────────────────────────────────

@app.route("/api/resumes", methods=["POST"])
def create_resume():
    body = request.json
    resume_id = gen_id()
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO resumes
               (id, jd_id, candidate_name, education, experience_years,
                location, industry, notice_period_days, raw_text, filename)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                resume_id,
                body.get("jd_id"),
                body.get("candidate_name"),
                body.get("education"),
                body.get("experience_years"),
                body.get("location"),
                body.get("industry"),
                body.get("notice_period_days"),
                body.get("raw_text"),
                body.get("filename"),
            ),
        )
        conn.commit()
        cur.execute("SELECT * FROM resumes WHERE id = %s", (resume_id,))
        row = cur.fetchone()
        return jsonify(row_to_dict(cur, row)), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/resumes", methods=["GET"])
def list_resumes():
    jd_id = request.args.get("jd_id")
    if not jd_id:
        return jsonify({"error": "jd_id query param required"}), 400
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT * FROM resumes WHERE jd_id = %s ORDER BY created_at ASC",
            (jd_id,),
        )
        rows = cur.fetchall()
        return jsonify([row_to_dict(cur, r) for r in rows])
    finally:
        cur.close()
        conn.close()


@app.route("/api/resumes/<resume_id>", methods=["PUT"])
def update_resume(resume_id):
    body = request.json
    conn = get_db()
    cur = conn.cursor()
    try:
        fields = []
        values = []
        for key in ["candidate_name", "education", "experience_years", "location", "industry", "notice_period_days"]:
            if key in body:
                fields.append(f"{key} = %s")
                values.append(body[key])
        if not fields:
            return jsonify({"error": "No fields to update"}), 400
        values.append(resume_id)
        cur.execute(f"UPDATE resumes SET {', '.join(fields)} WHERE id = %s", values)
        conn.commit()
        cur.execute("SELECT * FROM resumes WHERE id = %s", (resume_id,))
        row = cur.fetchone()
        return jsonify(row_to_dict(cur, row))
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/resumes/<resume_id>", methods=["DELETE"])
def delete_resume(resume_id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM resumes WHERE id = %s", (resume_id,))
        conn.commit()
        return jsonify({"ok": True})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# ─── RANKING CONFIGS ─────────────────────────────────────────────────

@app.route("/api/ranking-configs", methods=["POST"])
def create_ranking_config():
    body = request.json
    config_id = gen_id()
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO ranking_configs
               (id, jd_id, experience_priority, education_priority,
                location_priority, industry_priority, notice_period_priority)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (
                config_id,
                body.get("jd_id"),
                body.get("experience_priority", 1),
                body.get("education_priority", 2),
                body.get("location_priority", 3),
                body.get("industry_priority", 4),
                body.get("notice_period_priority", 5),
            ),
        )
        conn.commit()
        cur.execute("SELECT * FROM ranking_configs WHERE id = %s", (config_id,))
        row = cur.fetchone()
        return jsonify(row_to_dict(cur, row)), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# ─── RANKING RESULTS ─────────────────────────────────────────────────

@app.route("/api/ranking-results", methods=["POST"])
def create_ranking_results():
    body = request.json  # expects a list of result objects
    if not isinstance(body, list):
        return jsonify({"error": "Expected array of results"}), 400
    conn = get_db()
    cur = conn.cursor()
    try:
        inserted = []
        for item in body:
            result_id = gen_id()
            cur.execute(
                """INSERT INTO ranking_results
                   (id, config_id, resume_id, jd_id,
                    experience_score, education_score, location_score,
                    industry_score, notice_period_score, total_score, `rank`)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    result_id,
                    item.get("config_id"),
                    item.get("resume_id"),
                    item.get("jd_id"),
                    item.get("experience_score", 0),
                    item.get("education_score", 0),
                    item.get("location_score", 0),
                    item.get("industry_score", 0),
                    item.get("notice_period_score", 0),
                    item.get("total_score", 0),
                    item.get("rank", 0),
                ),
            )
            inserted.append(result_id)
        conn.commit()
        # Return all inserted
        format_strings = ",".join(["%s"] * len(inserted))
        cur.execute(
            f"SELECT * FROM ranking_results WHERE id IN ({format_strings}) ORDER BY `rank` ASC",
            inserted,
        )
        rows = cur.fetchall()
        return jsonify([row_to_dict(cur, r) for r in rows]), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/ranking-results", methods=["DELETE"])
def delete_ranking_results():
    config_id = request.args.get("config_id")
    if not config_id:
        return jsonify({"error": "config_id query param required"}), 400
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM ranking_results WHERE config_id = %s", (config_id,))
        conn.commit()
        return jsonify({"ok": True})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/ranking-results", methods=["GET"])
def get_ranking_results():
    config_id = request.args.get("config_id")
    if not config_id:
        return jsonify({"error": "config_id query param required"}), 400
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT * FROM ranking_results WHERE config_id = %s ORDER BY `rank` ASC",
            (config_id,),
        )
        rows = cur.fetchall()
        return jsonify([row_to_dict(cur, r) for r in rows])
    finally:
        cur.close()
        conn.close()


# ─── AI EXTRACTION ───────────────────────────────────────────────────

import urllib.request
import urllib.error

def generate_json_with_gemini(prompt: str, schema: dict) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured in backend .env file")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema
        }
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read()
            res_json = json.loads(res_body.decode('utf-8'))
            text = res_json['candidates'][0]['content']['parts'][0]['text']
            return json.loads(text)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        raise Exception(f"Gemini API Error: {err_body}")
    except Exception as e:
        raise e

RESUME_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "candidate_name": {"type": "STRING", "description": "Full name of the candidate. Return empty string if not found."},
        "education": {"type": "STRING", "description": "Highest education degree (e.g. B.Tech, MCA, MBA). Return empty string if not found."},
        "experience_years": {"type": "NUMBER", "description": "Total years of work experience as a number. Return 0 if not found."},
        "location": {"type": "STRING", "description": "Current location or city. Return empty string if not found."},
        "industry": {"type": "STRING", "description": "Primary industry of experience. Return empty string if not found."},
        "notice_period_days": {"type": "INTEGER", "description": "Notice period in days. Return 0 if not found."}
    },
    "required": ["candidate_name", "education", "experience_years", "location", "industry", "notice_period_days"]
}

@app.route("/api/extract/resume", methods=["POST"])
def extract_resume_api():
    body = request.json
    raw_text = body.get("text", "")
    try:
        prompt = f"Extract the following resume details into structured JSON. Do not invent information. Resume text:\n\n{raw_text}"
        result = generate_json_with_gemini(prompt, RESUME_SCHEMA)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


JD_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "required_education": {"type": "STRING", "description": "Required education degree. Return empty string if not found."},
        "required_experience_years": {"type": "NUMBER", "description": "Minimum required years of experience. Return 0 if not found."},
        "required_location": {"type": "STRING", "description": "Required location or city. Return empty string if not found."},
        "industry": {"type": "STRING", "description": "Industry of the job. Return empty string if not found."},
        "notice_period_days": {"type": "INTEGER", "description": "Maximum notice period in days. Return 0 if not found."}
    },
    "required": ["required_education", "required_experience_years", "required_location", "industry", "notice_period_days"]
}

@app.route("/api/extract/jd", methods=["POST"])
def extract_jd_api():
    body = request.json
    raw_text = body.get("text", "")
    try:
        prompt = f"Extract the following job description details into structured JSON. Do not invent information. Job Description text:\n\n{raw_text}"
        result = generate_json_with_gemini(prompt, JD_SCHEMA)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── HISTORY ─────────────────────────────────────────────────────────

@app.route("/api/history", methods=["GET"])
def get_history():
    conn = get_db()
    cur = conn.cursor()
    try:
        # Fetch all job descriptions (each represents an assessment session)
        cur.execute("SELECT * FROM job_descriptions ORDER BY created_at DESC")
        jds = cur.fetchall()
        
        history = []
        for jd in jds:
            jd_dict = row_to_dict(cur, jd)
            jd_id = jd_dict["id"]
            
            # Fetch resumes for this JD
            cur.execute("SELECT * FROM resumes WHERE jd_id = %s ORDER BY created_at ASC", (jd_id,))
            resumes = cur.fetchall()
            resume_dicts = [row_to_dict(cur, r) for r in resumes]
            
            # Append to history
            jd_dict["resumes"] = resume_dicts
            jd_dict["resume_count"] = len(resume_dicts)
            history.append(jd_dict)
            
        return jsonify(history)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# ─── AUTH ────────────────────────────────────────────────────────────

def init_users_table():
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
              id VARCHAR(36) PRIMARY KEY,
              email VARCHAR(255) NOT NULL UNIQUE,
              full_name VARCHAR(255) NOT NULL,
              password_hash VARCHAR(255) NOT NULL,
              role ENUM('recruiter', 'admin', 'viewer') DEFAULT 'recruiter',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
    except Exception as e:
        print(f"Error initializing users table: {e}")
    finally:
        cur.close()
        conn.close()

# Initialize it on startup
init_users_table()

@app.route("/api/auth/signup", methods=["POST"])
def signup_api():
    body = request.json
    name = body.get("name")
    email = body.get("email")
    password = body.get("password")
    
    if not name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400
        
    conn = get_db()
    cur = conn.cursor()
    try:
        # Check if user exists
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({"error": "Email already in use"}), 400
            
        user_id = gen_id()
        hashed_password = generate_password_hash(password)
        
        cur.execute(
            """INSERT INTO users (id, email, full_name, password_hash)
               VALUES (%s, %s, %s, %s)""",
            (user_id, email, name, hashed_password)
        )
        conn.commit()
        return jsonify({"ok": True, "id": user_id, "email": email, "name": name}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/auth/login", methods=["POST"])
def login_api():
    body = request.json
    email = body.get("email")
    password = body.get("password")
    
    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400
        
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, email, full_name, password_hash, role FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        
        if not user or not check_password_hash(user[3], password):
            return jsonify({"error": "Invalid email or password"}), 401
            
        return jsonify({"ok": True, "id": user[0], "email": user[1], "name": user[2], "role": user[4]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password_api():
    body = request.json
    email_address = body.get("email")
    if not email_address:
        return jsonify({"error": "Email is required"}), 400
        
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM users WHERE email = %s", (email_address,))
        user = cur.fetchone()
        if not user:
            # Return success to prevent email enumeration, but don't send an email
            return jsonify({"ok": True, "message": "If an account exists, a reset link has been sent."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()
        
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not smtp_email or not smtp_password:
        return jsonify({"error": "SMTP credentials are not configured in backend .env file"}), 500

    try:
        # Generate a mock reset token
        reset_link = f"http://localhost:5173/reset-password?token={gen_id()}"
        
        msg = MIMEMultipart()
        msg['From'] = smtp_email
        msg['To'] = email_address
        msg['Subject'] = "Password Reset Request - RecruitRank"
        
        body = f"Hello,\n\nYou have requested to reset your password. Please click the link below to reset it:\n{reset_link}\n\nIf you did not request this, please ignore this email.\n\nThanks,\nRecruitRank Team"
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.send_message(msg)
        server.quit()
        
        return jsonify({"ok": True, "message": "Password reset link sent"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── HEALTH CHECK ────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.fetchone()
        cur.close()
        conn.close()
        return jsonify({"status": "ok", "database": "connected"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", "5000"))
    print(f"RecruitRank API running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
