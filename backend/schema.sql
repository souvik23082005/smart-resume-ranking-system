-- RecruitRank Database Schema for MySQL
-- Connect to localhost:3306 with root / www.tr.com

CREATE DATABASE IF NOT EXISTS resume_ranking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE resume_ranking;

-- Users table (for future auth)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('recruiter', 'admin', 'viewer') DEFAULT 'recruiter',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Job Descriptions
CREATE TABLE IF NOT EXISTS job_descriptions (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  required_education VARCHAR(100) DEFAULT NULL,
  required_experience_years DECIMAL(4,1) DEFAULT NULL,
  required_location VARCHAR(100) DEFAULT NULL,
  industry VARCHAR(100) DEFAULT NULL,
  notice_period_days INT DEFAULT NULL,
  raw_text LONGTEXT DEFAULT NULL,
  source ENUM('manual', 'upload') DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resumes
CREATE TABLE IF NOT EXISTS resumes (
  id VARCHAR(36) PRIMARY KEY,
  jd_id VARCHAR(36) NOT NULL,
  candidate_name VARCHAR(255) DEFAULT NULL,
  education VARCHAR(100) DEFAULT NULL,
  experience_years DECIMAL(4,1) DEFAULT NULL,
  location VARCHAR(100) DEFAULT NULL,
  industry VARCHAR(100) DEFAULT NULL,
  notice_period_days INT DEFAULT NULL,
  raw_text LONGTEXT DEFAULT NULL,
  filename VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (jd_id) REFERENCES job_descriptions(id) ON DELETE CASCADE
);

-- Ranking Configurations
CREATE TABLE IF NOT EXISTS ranking_configs (
  id VARCHAR(36) PRIMARY KEY,
  jd_id VARCHAR(36) NOT NULL,
  experience_priority INT NOT NULL DEFAULT 1,
  education_priority INT NOT NULL DEFAULT 2,
  location_priority INT NOT NULL DEFAULT 3,
  industry_priority INT NOT NULL DEFAULT 4,
  notice_period_priority INT NOT NULL DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (jd_id) REFERENCES job_descriptions(id) ON DELETE CASCADE
);

-- Ranking Results
CREATE TABLE IF NOT EXISTS ranking_results (
  id VARCHAR(36) PRIMARY KEY,
  config_id VARCHAR(36) NOT NULL,
  resume_id VARCHAR(36) NOT NULL,
  jd_id VARCHAR(36) NOT NULL,
  experience_score DECIMAL(5,1) NOT NULL DEFAULT 0,
  education_score DECIMAL(5,1) NOT NULL DEFAULT 0,
  location_score DECIMAL(5,1) NOT NULL DEFAULT 0,
  industry_score DECIMAL(5,1) NOT NULL DEFAULT 0,
  notice_period_score DECIMAL(5,1) NOT NULL DEFAULT 0,
  total_score DECIMAL(5,1) NOT NULL DEFAULT 0,
  `rank` INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (config_id) REFERENCES ranking_configs(id) ON DELETE CASCADE,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  FOREIGN KEY (jd_id) REFERENCES job_descriptions(id) ON DELETE CASCADE
);
