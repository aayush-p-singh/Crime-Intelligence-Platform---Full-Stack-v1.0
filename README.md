# 🛡️ Crime Intelligence Platform

> **An AI-Powered Crime Intelligence & Decision Support System built using React, Neo4j AuraDB, FastAPI, Python and Machine Learning.**

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)
![Neo4j](https://img.shields.io/badge/Database-Neo4j_AuraDB-4581C3)
![FastAPI](https://img.shields.io/badge/API-FastAPI-009688)
![Python](https://img.shields.io/badge/Python-3.11-yellow)
![Status](https://img.shields.io/badge/Status-HackHazards_2026-success)

---

# 🚨 Problem Statement

Crime data in India is vast, fragmented, and difficult to interpret.

Law enforcement agencies, researchers, policymakers, and citizens often rely on static reports that answer **what happened**, but not:

- Why is crime increasing?
- Which regions share similar crime patterns?
- What trends are emerging?
- Which crimes are interconnected?
- What actions should decision-makers prioritize?

Traditional dashboards provide visualization but fail to capture the relationships between entities that drive real intelligence.

---

# 💡 Solution

Crime Intelligence Platform transforms raw crime statistics into an interactive intelligence system.

Instead of simply displaying crime data, the platform combines:

- Interactive Analytics
- AI-generated Insights
- Machine Learning Predictions
- Graph Database Relationships
- Decision Support

to help users explore crime patterns across India.

Neo4j AuraDB acts as the intelligence layer by modeling relationships between states, crimes, crime categories, trends, and analytical entities.

---

# ✨ Features

## 📊 Interactive Dashboard

- National crime overview
- KPI cards
- Trend visualization
- Interactive charts
- Dynamic filtering

---

## 🗺️ State Intelligence

- State-wise crime analytics
- Historical crime trends
- Crime rate comparison
- Population-normalized analysis
- State comparison

---

## 🤖 AI Intelligence

- Automated crime insights
- Trend interpretation
- Decision-support summaries
- Pattern explanation

---

## 📈 Predictive Analytics

Machine Learning models are used to estimate future crime trends based on historical NCRB datasets.

---

## 🔗 Graph Intelligence (Neo4j AuraDB)

Instead of storing data as isolated tables, the application models relationships between:

- States
- Crime Categories
- Crime Types
- Trends
- Intelligence Nodes

This enables connected queries that are difficult using relational databases.

---

## 📉 Data Visualization

- Bar Charts
- Line Charts
- Pie Charts
- Comparative Graphs
- Interactive Analytics

---

# 🏗️ System Architecture

```
                NCRB Dataset
                      │
          Data Cleaning & Processing
                      │
            Machine Learning Models
                      │
             FastAPI Backend APIs
                      │
        Neo4j AuraDB Graph Database
                      │
              React Frontend
                      │
      Interactive Intelligence Dashboard
```

---

# 🛠 Tech Stack

## Frontend

- React
- Tailwind CSS
- JavaScript
- Recharts

## Backend

- FastAPI
- Python

## Database

- Neo4j AuraDB

## Machine Learning

- Scikit-Learn
- Pandas
- NumPy

## Visualization

- Recharts

---

# 🧠 Why Neo4j?

Crime intelligence is relationship-driven.

Neo4j AuraDB allows the application to naturally represent and query connected data such as:

```
State
   │
Occurred In
   │
Crime
   │
Belongs To
   │
Category
   │
Linked With
   │
Trend
```

Graph relationships enable richer analytics compared to traditional relational databases.

---

# 📂 Dataset

Source:

National Crime Records Bureau (NCRB)

The project uses publicly available NCRB crime datasets along with cleaned and processed analytical data.

---

# 🎯 Use Cases

- Law Enforcement
- Crime Analysis
- Government Agencies
- Policy Planning
- Researchers
- Journalists
- Educational Institutions

---

# 📷 Screenshots

## Dashboard

<img width="1903" height="910" alt="image" src="https://github.com/user-attachments/assets/68b2a986-fefe-402e-8b5e-1dea013c617a" />
<img width="1905" height="863" alt="image" src="https://github.com/user-attachments/assets/17a6276c-54ea-4948-837d-d10db2ea4775" />


---

## State Analytics

<img width="1912" height="902" alt="image" src="https://github.com/user-attachments/assets/d4ee6884-10bd-4b6b-b166-4b2c208512c7" />


---

## AI Officer

<img width="1890" height="897" alt="image" src="https://github.com/user-attachments/assets/317b9cfe-647e-4059-9ba0-6f83b312dcb7" />


---


# 🚀 Future Scope

- Real-time crime ingestion
- Live police feeds
- GIS mapping
- AI Investigation Assistant
- Criminal Network Analysis
- Predictive hotspot mapping
- Multi-agent intelligence workflows
- Natural language crime search

---

# 👨‍💻 Team AlgoReaperX

**Aayush Pratap Singh**

HackHazards '26

---


# 🌐 Live Deployment

Frontend:

https://crime-intel-full-stack.vercel.app/

Backend:

[*(API Link)*](https://crime-intelligence.onrender.com)

---

# 📁 Repository Structure

```
Crime-Intelligence-Platform/

│
├── frontend/
├── backend/
├── models/
├── datasets/
├── api/
├── assets/
├── README.md
```

---

# 🏆 HackHazards 2026

Submitted for:

**HACKHAZARDS '26**

### Themes

- Public Systems, Governance & Civic Tech
- Trust, Identity & Security

### Partner Track

✅ Neo4j AuraDB Track
✅ Sarvam Track

---

# ⭐ Key Highlights

- AI-Powered Decision Support
- Neo4j AuraDB Graph Database
- Machine Learning Predictions
- Interactive Dashboards
- Crime Intelligence Platform
- Modern React UI
- Real-world Public Safety Application

---

## 📜 License

This project is developed for educational, research, and hackathon purposes.

MIT License.
