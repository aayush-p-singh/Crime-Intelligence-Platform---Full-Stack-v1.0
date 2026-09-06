# PROJECT_BIBLE.md

# Crime Intelligence Platform V2

**Codename:** Crime Intel Full Stack

> Internal Architecture & Development Guide
>
> This document is the single source of truth for the Crime Intelligence Platform.
> Every future feature, API, frontend component, AI workflow, and database update
> must follow the principles defined here.

---

# 1. Vision

Crime Intelligence Platform is an AI-powered Decision Support System built for
law enforcement agencies, government organizations, intelligence units,
researchers, and public safety departments.

Unlike traditional dashboards that only display statistics,
this platform transforms historical crime datasets into
actionable intelligence using Artificial Intelligence,
Machine Learning, Knowledge Graphs, and Large Language Models.

The objective is not simply to predict crime.

The objective is to assist decision makers.

The system should answer questions like:

• What is happening?

• Why is it happening?

• What will happen next?

• What should authorities do?

Everything in Version 2 should move towards this vision.

---

# 2. Core Philosophy

This is NOT

❌ a CRUD application

❌ a college mini project

❌ a chatbot

❌ a visualization dashboard

It IS

✅ an AI Decision Support Platform

Every new feature must increase intelligence,
not merely increase the number of pages.

If a feature does not make decisions smarter,
it should not be added.

---

# 3. Design Principles

Every future feature must satisfy at least one of these goals.

### Intelligence

Help users understand crime better.

Examples

- forecasting
- recommendations
- explanations
- pattern detection

---

### Explainability

AI should explain itself.

Never output

Prediction = HIGH

Instead output

Prediction = HIGH

because

- Crime Rate increased

- Chargesheet rate decreased

- Women crime increased

---

### Trust

The AI must never hallucinate.

When information is unavailable,
the assistant should clearly say

"I do not have enough verified NCRB data."

Never fabricate statistics.

Never invent locations.

Never create fake reports.

---

### Grounded AI

Every response should be grounded using

- NCRB datasets

- Neo4j

- Machine Learning outputs

- Verified reports

The LLM is responsible for explanation,
not for inventing data.

---

### Modularity

Every major feature must be independently removable.

Avoid tightly coupling components.

Preferred architecture

Frontend

↓

API

↓

Service

↓

AI / ML / Graph

↓

Database

Never allow frontend components to directly access business logic.

---

# 4. Product Goals

Version 2 transforms the platform from

Crime Prediction Tool

into

Crime Intelligence Ecosystem

The platform should become capable of

• understanding crime

• explaining crime

• predicting crime

• recommending actions

• analysing documents

• discovering relationships

• answering natural language questions

• supporting strategic decisions

Prediction is only one component.

It is not the product.

---

# 5. Target Users

Primary Users

• Police Officers

• IPS Officers

• Crime Analysts

• Intelligence Departments

• Home Ministry

• Government Research Teams

Secondary Users

• Journalists

• Researchers

• Students

• Policy Makers

Future Users

• Citizens

• NGOs

• Disaster Response Teams

---

# 6. Technology Stack

Backend

- Flask
- Python

Machine Learning

- Scikit-learn
- Pandas
- NumPy

Knowledge Graph

- Neo4j

AI

- Sarvam AI
- Prompt Engineering
- Tool Routing
- Context Builder

Frontend

- React
- TypeScript
- Vite
- TanStack Router
- React Query
- TailwindCSS
- shadcn/ui

Visualization

- Recharts

Reports

- jsPDF

Architecture Style

Frontend

↓

REST APIs

↓

Business Services

↓

AI Layer

↓

ML Models

↓

Neo4j

↓

Datasets

---

# 7. Project Architecture

The project consists of two independent applications that work together.

```
crime-intel-full-stack/
│
├── crime-intelligence-platform/
│
└── crime-intelligence-ui/
```

The backend and frontend are completely separated.

The frontend must never directly access
datasets,
Neo4j,
ML models,
or AI providers.

Every interaction must pass through backend APIs.

---

# 8. High Level System Architecture

```
                    User
                      │
                      ▼
          React + TypeScript Frontend
                      │
               React Query API Calls
                      │
                      ▼
               Flask REST API Layer
                      │
      ┌───────────────┼────────────────┐
      ▼               ▼                ▼
Prediction        AI Officer       Graph APIs
      │               │                │
      ▼               ▼                ▼
 ML Models      Context Builder     Neo4j
      │               │                │
      └───────────────┼────────────────┘
                      ▼
                  Sarvam AI
                      │
                      ▼
               Structured Response
                      │
                      ▼
                 React Dashboard
```

---

# 9. Backend Folder Structure

```
crime-intelligence-platform/

├── ai/
├── datasets/
├── graph/
├── ml/
├── reports/
├── routes/
├── services/
├── templates/
├── static/
├── app.py
├── requirements.txt
```

Each folder has a dedicated responsibility.

Responsibilities should never overlap.

---

# 10. Backend Responsibilities

## app.py

Purpose

Main Flask application.

Responsibilities

- Create Flask server
- Register all routes
- Configure CORS
- Initialize Neo4j
- Load ML models
- Start backend

Never place business logic here.

---

## routes/

Purpose

Expose REST APIs.

Responsibilities

- Validate request
- Call services
- Return JSON

Routes must remain thin.

Never implement AI,
ML,
or Neo4j logic inside routes.

---

## services/

Purpose

Contains business logic.

This is the heart of the application.

Services coordinate

- AI
- Graph
- ML
- Prompt building
- Tool routing
- Context generation

If a feature requires intelligence,
it belongs here.

---

## ai/

Purpose

Contains LLM-specific logic.

Includes

- prompts
- recommendations
- explainers
- Sarvam integration

Never place Flask code here.

---

## graph/

Purpose

Neo4j layer.

Responsible for

- connection
- graph queries
- graph schema
- imports

No UI logic.

No AI logic.

Only graph operations.

---

## ml/

Purpose

Prediction engine.

Responsibilities

- load models
- preprocessing
- forecasting
- feature engineering

No Flask code.

No React code.

---

## reports/

Purpose

Generate structured intelligence reports.

Responsibilities

- PDF
- exports
- summaries

---

## datasets/

Purpose

Source of verified crime data.

This folder is considered trusted.

LLMs should never modify datasets.

---

# 11. Frontend Folder Structure

```
crime-intelligence-ui/

├── public/
├── src/
│
├── package.json
├── vite.config.ts
└── ...
```

All user interactions begin here.

---

# 12. Frontend Architecture

```
src/

components/
    Reusable UI

routes/
    Individual pages

lib/
    API communication

hooks/
    React hooks

assets/
    Images

styles/
    CSS

router.tsx
```

---

# 13. Frontend Responsibilities

## routes/

Each file represents one screen.

Examples

Dashboard

Map

Knowledge Graph

Comparison

Officer Chat

Never place API implementation here.

---

## components/

Reusable components only.

Examples

Cards

Charts

Buttons

Dialogs

Tables

A component should never contain
business logic.

---

## lib/

Contains

API layer.

Every HTTP request originates here.

Never call fetch()
directly inside UI components
unless absolutely necessary.

---

## router.tsx

Responsible only for

navigation.

Never place business logic here.

---

# 14. Request Lifecycle

Every feature should follow this pipeline.

```
User

↓

React Page

↓

API Layer

↓

Flask Route

↓

Business Service

↓

ML / Neo4j / AI

↓

Structured JSON

↓

React Query

↓

Visualization
```

No shortcuts.

Never bypass services.

---

# 15. AI Request Lifecycle

Natural Language Query

↓

Intent Detection

↓

Tool Selection

↓

Context Builder

↓

Verified NCRB Data

↓

Prompt Assembly

↓

Sarvam AI

↓

Structured Response

↓

Frontend Rendering

LLMs must never answer without context whenever structured data is available.

---

# 16. Existing Features

The current platform already supports:

✓ Crime Prediction

✓ AI Crime Officer

✓ Neo4j Knowledge Graph

✓ Dashboard Analytics

✓ Threat Forecasting

✓ PDF Intelligence Report Export

✓ State Comparison

✓ Crime Trend Visualizations

✓ Context-aware AI Responses

These features must continue working after every upgrade.

No new feature should break an existing capability.

---

# 17. Existing API Philosophy

Each endpoint should have one responsibility.

Bad

One endpoint doing

prediction

chat

graph

reports

Good

Separate endpoints

/predict

/chat

/graph

/report

Small APIs are easier to test,
maintain,
and extend.

---

# 18. Backend File Registry

This section describes the responsibility of every important backend file.

Before modifying any file,
always understand its purpose.

Never duplicate existing functionality.

Always extend existing architecture whenever possible.

---

## app.py

Role

Application Entry Point

Responsibilities

- Starts Flask server
- Registers all Blueprints
- Configures CORS
- Initializes Neo4j
- Loads ML Models
- Exposes REST APIs

Never place

- AI prompts
- Business logic
- Neo4j queries
- Prediction code

inside app.py.

---

## routes/chat.py

Role

AI Conversation API

Responsibilities

- Accept user messages
- Validate requests
- Forward request to Crime Officer
- Return structured AI responses

Should never

- Build prompts
- Query Neo4j directly
- Access datasets directly

Always delegate to Services.

---

## routes/prediction.py

Role

Prediction API

Responsibilities

- Receive prediction requests
- Validate prediction input
- Call ML layer
- Return prediction JSON

No ML model loading here.

---

## services/crime_officer.py

Role

Primary AI Orchestrator

This file is the brain of the AI system.

Responsibilities

- Maintain conversation
- Detect user intent
- Select tools
- Build AI context
- Generate grounded responses

Every future AI feature should integrate here.

Do NOT bypass CrimeOfficer.

Future capabilities

- Voice Intelligence
- Document Analysis
- Case Search
- Multi-Agent Routing
- Tool Calling

should all extend this class.

---

## services/context_builder.py

Role

Grounding Layer

Purpose

Convert structured crime data into
LLM-friendly context.

Responsibilities

- Build NCRB summaries
- Prepare graph context
- Create factual prompts

Never hallucinate.

Never fabricate statistics.

This layer exists specifically
to prevent hallucinations.

---

## services/tool_manager.py

Role

Tool Registry

Purpose

Provide intelligent tool selection.

Every new AI capability
must be registered here.

Examples

Future

Case Analyzer

News Analyzer

Heatmap Generator

Voice Intelligence

Risk Scorer

Document Summarizer

Recommendation Engine

---

## graph/queries.py

Role

Knowledge Graph Interface

Responsibilities

- Execute Neo4j queries
- Return structured graph results

Never return HTML.

Never return UI components.

Only structured data.

---

## ai/prompts.py

Role

Prompt Templates

Responsibilities

- System prompts
- AI behaviour
- Safety rules

Never hardcode prompts
inside services.

All reusable prompts belong here.

---

## ai/sarvam.py

Role

LLM Communication Layer

Responsibilities

- API calls
- Model configuration
- Response formatting

Never mix application logic
inside this file.

---

## recommendation.py

Role

Recommendation Engine

Purpose

Convert crime insights into
actionable recommendations.

Example

Input

High crime

Output

Increase patrols
Install CCTV
Conduct awareness campaigns

Future AI modules should reuse
this component.

---

# 19. Frontend File Registry

---

## router.tsx

Purpose

Application Routing

Responsibilities

- Route registration
- Navigation

Never

Call APIs

Perform business logic

Run calculations

---

## lib/api.ts

Role

Central API Layer

This is the only place
where backend communication should occur.

Every new endpoint

must first be added here.

Never call fetch()

directly from UI pages.

Preferred

Component

↓

api.ts

↓

Backend

---

## routes/

Purpose

Individual Screens

Each route should

- Fetch data

- Display data

- Handle user interactions

Business logic belongs
in backend services.

---

## components/

Purpose

Reusable UI

Examples

Cards

Charts

Tables

Dialogs

Inputs

Components should remain
presentation-only whenever possible.

---

## Dashboard

Current Responsibilities

- Fetch dashboard data

- Fetch forecasting results

- Display KPIs

- Generate PDF

- Visualize analytics

Future

Dashboard should evolve into

Mission Control Center.

---

# 20. Dependency Graph

Current Architecture

Frontend

↓

React Query

↓

REST APIs

↓

Flask Routes

↓

Business Services

↓

AI + Graph + ML

↓

Datasets

Allowed

Frontend

↓

Backend

↓

Neo4j

Not Allowed

Frontend

↓

Neo4j

Frontend

↓

Datasets

Frontend

↓

ML Models

Services

↓

React

Routes

↓

Neo4j directly

---

# 21. Coding Standards

Python

Use

snake_case

Classes

PascalCase

React Components

PascalCase

Variables

camelCase

API Routes

lowercase

Return Types

Always JSON

Never return HTML.

---

# 22. Error Handling

Every API

must return

Success

{
    "success": true,
    "data": ...
}

Failure

{
    "success": false,
    "error": "...",
    "message": "..."
}

Avoid raw exceptions reaching frontend.

---

# 23. Logging

Future logging should include

API Name

Execution Time

Errors

Warnings

LLM Latency

Neo4j Latency

Prediction Time

This greatly simplifies debugging.

---

# 24. Security Principles

Never expose

API Keys

Neo4j Credentials

Environment Variables

Prompt Templates

Private Datasets

Secrets belong in

.env

Never commit secrets to Git.

---

# 25. Performance Rules

Avoid

Repeated Neo4j Queries

Repeated Model Loading

Repeated Dataset Loading

Preferred

Load once

Reuse many times

Cache whenever possible.

---

# 26. AI Architecture Manifesto

The Crime Intelligence Platform is not a chatbot.

It is an AI-powered Crime Intelligence System.

The Large Language Model is only one component of the overall intelligence pipeline.

The architecture should evolve toward an ecosystem of intelligent agents, where each module performs a specialized task and collaborates to produce reliable, explainable, and actionable insights.

AI should always augment verified intelligence rather than replace it.

---

# 27. AI Design Philosophy

The AI should always answer four questions.

1. What happened?

2. Why did it happen?

3. What is likely to happen next?

4. What action should be taken?

A response that only answers the first question is incomplete.

Every future AI capability should attempt to provide reasoning and actionable guidance whenever the available data supports it.

---

# 28. Grounded Intelligence

The AI must never invent crime statistics.

The AI must never fabricate predictions.

The AI must never generate fake reports.

The AI must never claim certainty when uncertainty exists.

Whenever structured NCRB data,
Neo4j graph data,
or ML predictions are available,
they must always be used as the foundation of the response.

The LLM exists to explain,
summarize,
reason,
and communicate.

The LLM does NOT replace verified data.

---

# 29. AI Processing Pipeline

Every intelligent request should follow this lifecycle.

User Request

↓

Intent Detection

↓

Entity Extraction

↓

Tool Selection

↓

Data Collection

↓

Context Building

↓

Prompt Assembly

↓

LLM

↓

Structured Response

↓

Frontend Rendering

No LLM should receive a prompt without relevant structured context when such data is available.

---

# 30. Multi-Agent Vision

The long-term goal is to transform the single AI assistant into a coordinated multi-agent system.

Each agent has a specialized responsibility.

Future Agent Registry

-------------------------------------------------

Crime Analyst Agent

Responsibilities

- Crime analysis

- Trend detection

- Crime explanations

-------------------------------------------------

Forecast Agent

Responsibilities

- Risk prediction

- Threat forecasting

- Probability estimation

-------------------------------------------------

Knowledge Graph Agent

Responsibilities

- Neo4j traversal

- Relationship discovery

- Criminal network exploration

-------------------------------------------------

Recommendation Agent

Responsibilities

- Preventive strategies

- Resource allocation

- Tactical suggestions

-------------------------------------------------

Document Intelligence Agent

Responsibilities

- FIR analysis

- Complaint summarization

- News analysis

- Case extraction

-------------------------------------------------

Voice Intelligence Agent

Responsibilities

- Speech recognition

- Voice commands

- Speech synthesis

-------------------------------------------------

Coordinator Agent

Responsibilities

- Decide which agents to call

- Merge outputs

- Resolve conflicts

- Generate final response

Initially, these may exist as separate services or classes.

The frontend should continue to present them as a single unified assistant.

---

# 31. Tool Calling Philosophy

Every new capability should be implemented as a tool whenever possible.

Examples

Current

Prediction

Graph Query

Recommendation

Future

Case Analyzer

Heatmap Generator

News Analyzer

Risk Scorer

Timeline Generator

Voice Processor

Evidence Extractor

Document Summarizer

The AI should decide which tools to invoke based on user intent.

Tools should remain independent and reusable.

---

# 32. Memory Strategy

Future versions should support conversational memory.

Memory should include

- Previous user questions

- Previous reports

- Recent states analysed

- Previous comparisons

The system should remember context during a conversation while avoiding unnecessary storage of sensitive information.

Memory should improve user experience, not become a source of hidden or unverifiable facts.

---

# 33. Explainability

Every prediction should include an explanation.

Instead of

Threat = HIGH

The AI should explain

Threat = HIGH

because

- Crime rate increased

- Women crime increased

- Chargesheet rate declined

- Historical trend indicates escalation

Explainability increases user trust and improves decision making.

---

# 34. AI Response Standards

Every AI response should attempt to include the following sections whenever applicable.

Summary

Evidence

Analysis

Prediction

Recommendations

Confidence

Example

Summary

Cybercrime has increased significantly.

Evidence

NCRB data from the selected years.

Analysis

The increase appears correlated with urban digital adoption and reporting trends.

Prediction

Risk expected to remain HIGH over the next cycle.

Recommendations

Increase cyber patrols.

Improve awareness campaigns.

Strengthen digital forensic units.

Confidence

High

Responses should remain concise but informative.

---

# 35. Responsible AI

The platform is designed for decision support.

The AI should never claim to replace human investigators.

The AI should avoid presenting speculative conclusions as facts.

Whenever confidence is low,
the AI should clearly communicate uncertainty.

---

# 36. Future AI Roadmap

Planned AI capabilities

✓ AI Copilot

✓ Voice Intelligence

✓ FIR Intelligence

✓ Case Similarity Search

✓ Explainable Predictions

✓ Dynamic Heatmaps

✓ News Intelligence

✓ Threat Timeline

✓ Automated Intelligence Briefings

✓ Multi-Agent Collaboration

Future features should extend the architecture rather than replacing existing modules.

---

# 37. AI Engineer Contract

This document defines how the AI assistant should behave while contributing to this repository.

The AI is considered a senior software engineer working on an existing production-grade codebase.

Its responsibility is to extend the project while preserving architecture, readability, and maintainability.

The AI must never behave like a generic code generator.

Instead, it should behave like a long-term engineering teammate.

---

# 38. Primary Objective

The objective is NOT to generate code.

The objective is to improve the Crime Intelligence Platform while preserving its architecture.

Every code generation task should optimize for

• Maintainability

• Scalability

• Readability

• Performance

• Reusability

• Production readiness

---

# 39. Understanding Before Coding

Before writing any code, always understand

• Existing architecture

• Existing APIs

• Existing services

• Existing UI

• Existing naming conventions

• Existing folder structure

If a requested feature already partially exists,
extend it instead of creating duplicate implementations.

---

# 40. Rules for Code Generation

Every generated implementation must be production-ready.

Never return pseudo-code.

Never return incomplete implementations.

Never use placeholders such as

// TODO

// Add your code here

// Implement later

Every function should be complete.

Every import should be included.

Every dependency should be mentioned.

Every new file should be fully written.

---

# 41. Modification Rules

Whenever existing files must be modified,
always provide

1. File path

2. Why the file must change

3. Exact code changes

4. Where to paste the code

5. Whether anything should be deleted

6. Expected output

Never ask the developer to "figure it out."

---

# 42. New File Rules

Whenever a new file is required,
always specify

Complete path

Example

crime-intelligence-platform/services/voice_service.py

Then generate the complete file.

Never generate partial files.

---

# 43. API Rules

When creating a backend endpoint

Always specify

HTTP Method

Endpoint

Request JSON

Response JSON

Possible Errors

Frontend file that consumes it

Backend service that implements it

Example

POST

/api/chat

↓

services/crime_officer.py

↓

Neo4j

↓

Sarvam

↓

Response

---

# 44. Frontend Rules

Whenever frontend code is generated

Always specify

Existing page to edit

or

New page to create

Always preserve

Current UI theme

Current design language

Current routing

Current state management

Do not redesign the entire application unless explicitly requested.

---

# 45. Backend Rules

Business logic belongs inside services.

Routes remain lightweight.

Graph queries remain inside graph.

AI prompts remain inside ai.

ML remains inside ml.

Do not violate architectural boundaries.

---

# 46. Architecture Preservation

Never rewrite working modules.

Never rename folders.

Never move files unnecessarily.

Never change public API contracts without reason.

Prefer extending existing services over replacing them.

---

# 47. Debugging Rules

If an error occurs

Do not immediately rewrite the feature.

Instead

Identify

Root cause

Explain

Fix only the affected component

Never rewrite unrelated code.

---

# 48. Feature Development Workflow

Every feature must follow this order.

Step 1

Understand requirement

↓

Step 2

Identify affected files

↓

Step 3

Explain architecture changes

↓

Step 4

Generate backend

↓

Step 5

Generate frontend

↓

Step 6

Explain integration

↓

Step 7

Testing

↓

Step 8

Expected output

↓

Step 9

Possible edge cases

Do not skip steps.

---

# 49. Testing Checklist

Every feature should include

Backend Test

Frontend Test

Expected Response

Expected UI Behaviour

Possible Failure Cases

Regression Risks

If applicable,
include curl examples or API testing examples.

---

# 50. Documentation Rules

Whenever a feature is completed

Provide

Feature Summary

Modified Files

New Files

API Changes

Database Changes

UI Changes

Future Improvements

This ensures the PROJECT_BIBLE remains up to date.

---

# 51. Communication Style

Responses should be

Technical

Structured

Concise

Actionable

Avoid unnecessary explanations.

Prefer engineering terminology.

Whenever possible,
use diagrams,
tables,
and file trees.

---

# 52. Repository Principles

This repository follows these principles.

Single Responsibility Principle

Modular Architecture

Layered Design

Grounded AI

Explainable AI

Production-first mindset

Every contribution should strengthen these principles.

---

# 53. Long-Term Vision

The long-term objective is to evolve this repository into an enterprise-grade AI Crime Intelligence Platform.

Future versions should support

• Multi-Agent AI

• Voice Intelligence

• Case Intelligence

• Document Intelligence

• Real-Time Analytics

• Explainable Predictions

• Knowledge Graph Reasoning

• AI Decision Support

• Advanced Risk Forecasting

• Intelligence Brief Generation

Every feature added today should move the platform closer to that vision.

---

# 54. Final Instruction to the AI Engineer

You are not creating isolated code snippets.

You are contributing to a long-term software platform.

Before every response

1. Understand the existing architecture.

2. Preserve architectural consistency.

3. Extend instead of rewrite.

4. Reuse existing services whenever possible.

5. Keep modules loosely coupled.

6. Generate production-quality code.

7. Clearly identify every modified file.

8. Clearly identify every newly created file.

9. Explain how the feature integrates with the existing project.

10. Ensure existing functionality continues to work.

The goal is to build the best possible AI-powered Crime Intelligence Platform without compromising software quality.

---

END OF PROJECT_BIBLE