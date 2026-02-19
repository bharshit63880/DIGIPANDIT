# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## Project Name: Digi Pandit AI System

### 1. INTRODUCTION

#### 1.1 Purpose

Ye document Digi Pandit AI System ke liye complete functional aur non-functional requirements define karta hai. System ka objective hai ek AI-based virtual pandit banana jo ghar baith kar users ko shuddh vidhi ke sath puja, katha aur hawan karwaye.

#### 1.2 Scope

System:

- Har puja ki step-by-step vidhi batayega
- Mantra shuddh ucharan ke sath sunayega
- Katha explain karega
- Hawan guide karega
- Muhurat calculate karega
- Personalized sankalp generate karega

### 2. OVERALL DESCRIPTION

#### 2.1 Product Perspective

Digi Pandit AI ek SaaS based system hoga jisme:

- Web App
- Mobile App (Android / iOS)
- Admin Panel
- AI Backend
- Panchang Engine

#### 2.2 User Classes

| User Type      | Description                     |
|----------------|---------------------------------|
| General User   | Ghar par puja karne wala       |
| Premium User   | Subscription based advanced features |
| Admin          | Content manage karega           |
| Dharm Expert   | Mantra validate karega          |

### 3. SYSTEM FEATURES

#### 3.1 User Registration & Profile

Functional Requirements:

- **FR-1:** User email/OTP se register kare
- **FR-2:** Profile details add kare:
  - Naam
  - Gotra
  - Rashi
  - Nakshatra
- **FR-3:** User subscription manage kar sake

#### 3.2 Puja Module

##### 3.2.1 Puja Selection

System allow karega selection:

- Ganesh Puja
- Satyanarayan Puja
- Lakshmi Puja
- Rudrabhishek
- Griha Pravesh
- Vivah Vidhi
- Navratri Puja

##### 3.2.2 Puja Flow

Har puja me following sequence hoga:

- Muhurat display
- Samagri list
- Sankalp
- Kalash sthapana
- Avahan mantra
- Main puja mantra
- Aarti
- Katha
- Hawan (optional)
- Visarjan

#### 3.3 AI Guided Mode

Functional Requirements:

- **FR-20:** AI voice step announce kare
- **FR-21:** Mantra screen par show ho
- **FR-22:** “Next Step” automation
- **FR-23:** Personalized naam mantra me insert ho

#### 3.4 Panchang & Muhurat Engine

System calculate kare:

- Tithi
- Nakshatra
- Rahukaal
- Abhijit Muhurat

Geo-location based calculation hoga.

#### 3.5 Hawan Mode

- **FR-30:** Ahuti mantra loop
- **FR-31:** Ahuti count tracking
- **FR-32:** Fire animation background
- **FR-33:** Hawan samagri display

#### 3.6 Multi-language Support

- Hindi
- English
- Sanskrit (text)
- Gujarati
- Tamil (Phase 2)

### 4. NON-FUNCTIONAL REQUIREMENTS

#### 4.1 Performance

- Page load time < 2 sec
- AI response time < 3 sec
- 10,000 concurrent users support

#### 4.2 Security

- JWT Authentication
- HTTPS encryption
- Role-based access control
- Encrypted user data
- Secure mantra database (tamper proof)

#### 4.3 Availability

- 99.5% uptime
- Auto scaling server

#### 4.4 Scalability

- Microservices architecture
- Independent scaling:
  - AI Service
  - Panchang Service
  - User Service
  - Payment Service

### 5. SYSTEM ARCHITECTURE

#### 5.1 Frontend

- React / Next.js
- Futuristic devotional UI
- Dark Temple theme
- Animated diya effects

#### 5.2 Backend

- Node.js + Express
- REST APIs
- WebSocket for live guidance

#### 5.3 Database

- PostgreSQL (User data)
- MongoDB (Puja content)
- Vector DB (AI knowledge retrieval)

### 6. DATABASE SCHEMA (High Level)

- **Users Table**
  - id
  - name
  - email
  - gotra
  - rashi
  - subscription_type

- **Puja Table**
  - puja_id
  - puja_name
  - description
  - language

- **Mantra Table**
  - mantra_id
  - puja_id
  - mantra_text
  - audio_url
  - sequence_number

### 7. EXTERNAL INTERFACES

#### 7.1 Payment Gateway

- Razorpay
- Stripe

#### 7.2 Panchang API (Optional)

### 8. FUTURE ENHANCEMENTS

- AR Puja Mode
- 3D Virtual Temple
- Live Pandit booking
- Samagri delivery integration
- AI Astrology recommendation

### 9. RISKS

| Risk                    | Mitigation                        |
|-------------------------|-----------------------------------|
| Wrong mantra            | Pandit validation                 |
| Religious sensitivity   | Content review board              |
| Legal issues            | Disclaimer + Legal review         |

### 10. ASSUMPTIONS

- Users basic puja knowledge rakhte honge
- Internet available hoga
- Device speaker available hoga

### 11. DEPLOYMENT PLAN

**Phase 1 (MVP):**

- 5 Puja
- Hindi + English
- Basic voice guide

**Phase 2:**

- Hawan Mode
- Panchang engine
- Personalization

**Phase 3:**

- AR mode
- Regional language
- Premium subscription

### 12. SUCCESS METRICS

- Daily Active Users
- Puja Completion Rate
- Subscription Conversion Rate
- User Satisfaction Score

🎯 **Conclusion**

Digi Pandit AI ek scalable devotional AI SaaS product hoga jo:

- Personalized puja experience dega
- High religious accuracy maintain karega
- Commercially scalable hoga
