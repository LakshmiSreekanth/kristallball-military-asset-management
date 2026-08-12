-- Military Asset Management System - PostgreSQL Schema
-- Compatible with PostgreSQL; backend uses SQLite for local dev

CREATE TABLE bases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) CHECK (role IN ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER')),
    base_id INT REFERENCES bases(id) ON DELETE SET NULL
);

CREATE TABLE equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('WEAPON', 'VEHICLE', 'AMMUNITION'))
);

CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    base_id INT NOT NULL REFERENCES bases(id),
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    source_base_id INT NOT NULL REFERENCES bases(id),
    destination_base_id INT NOT NULL REFERENCES bases(id),
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) DEFAULT 'COMPLETED',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    initiated_by INT REFERENCES users(id)
);

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    base_id INT NOT NULL REFERENCES bases(id),
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
    personnel_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    date DATE DEFAULT CURRENT_DATE,
    created_by INT REFERENCES users(id)
);

CREATE TABLE expenditures (
    id SERIAL PRIMARY KEY,
    base_id INT NOT NULL REFERENCES bases(id),
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    reason TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_by INT REFERENCES users(id)
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchases_base ON purchases(base_id);
CREATE INDEX idx_purchases_equipment ON purchases(equipment_type_id);
CREATE INDEX idx_transfers_source ON transfers(source_base_id);
CREATE INDEX idx_transfers_dest ON transfers(destination_base_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
