## 🧠 Finance Coach Chatbot

A full-stack financial management application featuring secure user authentication, personal transaction tracking, and an integrated AI conversational coach for smart financial guidance.

### ✨ Overview

This application uses a modern **MERN-adjacent stack** (React frontend and Node.js/Express backend with MongoDB) to provide users with tools to manage their finances effectively. It combines traditional CRUD functionality for transaction logging with the power of generative AI to offer personalized financial advice and analysis.

### 🚀 Key Features

* **Secure Authentication:** User registration and login managed securely on the backend.
* **Transaction Management:** Full CRUD capabilities for recording and managing personal financial transactions.
* **AI Financial Coaching:** Dedicated chat endpoint integrated with the **OpenAI API** to provide conversational financial advice, budget tips, and spending analysis.
* **Data Visualization:** Dashboard views with charts and graphs powered by **Recharts** for intuitive financial oversight.
* **API Protected Routes:** Routes for transactions and chat are protected by authentication middleware to ensure data security.

### 💻 Tech Stack

The project is structured into two main components: `client` (frontend) and `server` (backend).

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | **React** | Main JavaScript library for building the UI. |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework for rapid UI development. |
| **Data Viz** | **Recharts** | Declarative charting library for React used in the Dashboard. |
| **Backend** | **Node.js / Express** | Fast, unopinionated web framework running the server logic. |
| **Database** | **MongoDB / Mongoose** | Flexible NoSQL database with Mongoose ODM for data modeling. |
| **AI Integration** | **OpenAI** | Powers the core financial coaching logic. |
| **Security** | **BcryptJS / JSON Web Token** | Used for secure password hashing and stateless session management. |
| **Build Tool** | **Vite** | Next-generation frontend tooling for optimized client build. |

