# 💨 Air Quality Monitoring Dashboard

A professionally engineered, real-time air quality monitoring dashboard integrating advanced Reinforcement Learning (RL) for predictive analytics and actionable insights. This application empowers users with comprehensive data visualization, health impact assessment, and an AI-driven conversational assistant to help understand and mitigate air pollution risks in their environment.

---

## ✨ Features

**Real-time Air Quality Readings**
- Live display of sensor data for key pollutants: CO (MQ-9), VOCs (MQ-135), CH4/LPG (MQ-5), PM1.0, PM2.5, and PM10.
- Intuitive color-coding of readings (e.g., green = good, red = hazardous) for quick status assessment.

**Intelligent AI Analyzer (Powered by Reinforcement Learning)**
- Utilizes a sophisticated RL model to process current and historical air quality data.
- Provides clear "Effect on Human Health" insights for detected pollutant levels.
- Recommends "Best Actions to Reduce Presence" of harmful gases and particulates, based on data-driven optimal strategies.

**Interactive Data Visualization**
- Switch seamlessly between Heatmaps, Line Charts, and Bar Graphs to explore data.
- Dynamically generated heatmaps visualize pollutant concentrations over time or across sensor locations.
- Calendar/date-time picker for quick access to historical data; real-time visualization is default.

**PDF Report Generation & Download**
- Instantly generate downloadable PDF reports summarizing current readings, AI analysis, and recommendations.
- Reports include timestamps, raw sensor data, and comprehensive health/action insights.

**Conversational AI Chatbot**
- Integrated AI chatbot provides on-demand, project-scoped assistance.
- Answers questions about air quality conditions, health impacts, recommended actions, sensor readings, and dashboard usage.
- Politely declines or redirects out-of-scope queries.

**User-Configurable Theme**
- Switch between professional Dark and Light modes via a Settings (gear) icon.
- Theme preferences are saved locally and persist across sessions for a consistent experience.

**Professional & Responsive Design**
- Clean, modern, and user-centric UI/UX.
- Optimized for desktops, tablets, and mobile devices for seamless interaction.

---

## 🚀 Technologies Used

This project is implemented with [Next.js](https://nextjs.org/) for a modern, production-grade React-based frontend application, seamlessly integrated with Firebase for backend and cloud services.

**Frontend:**
- **Next.js:** Provides server-side rendering, routing, and optimized static generation for a fast, SEO-friendly application.
- **React:** Component-based architecture for maintainable, scalable UI.
- **TypeScript:** Type safety and improved developer experience.
- **Chart.js / D3.js:** Advanced data visualization.
- **CSS / SCSS / Tailwind CSS:** Modular and themeable styling supporting dark/light mode.
- **Integration with Firebase SDK:** Direct interaction with Firestore, Authentication, and Cloud Functions from the Next.js frontend.

**Backend & Data:**
- **Firebase Firestore:** Real-time NoSQL database for sensor readings and AI analysis results.
- **Firebase Cloud Functions:** Serverless backend for:
  - Triggering RL model inference upon new data.
  - Generating and serving PDF reports.
- **Firebase Hosting:** Secure deployment of the web application.
- **(Optional) Firebase Authentication:** User account management.

**AI / Reinforcement Learning:**
- Pre-trained RL model for real-time analysis and recommendations.
- Model deployed and served via Cloud Functions for scalable inference.

---

## 🏗️ Implementation Details

The dashboard is developed as a Next.js application, leveraging its powerful features to deliver a seamless, performant user experience:

- **Data Fetching:** Uses Next.js API routes and React hooks to fetch real-time sensor data from Firebase Firestore, ensuring up-to-date air quality information.
- **Server-Side Rendering (SSR) & Static Generation (SSG):** Key pages use SSR or SSG for performance and SEO optimization, while client-side hydration ensures interactivity.
- **Dynamic Imports:** Heavy visualization components and PDF generation libraries are dynamically imported to optimize initial load times.
- **Environment Variables:** Securely store Firebase configuration and API keys using Next.js environment variable management.
- **Theming:** Theme state is managed globally (using Context API or similar), with persistent storage in localStorage for consistent user experience across sessions.
- **AI Integration:** When new sensor data is added, a Firebase Cloud Function is triggered to process the data through the RL model and update Firestore with analysis results. The Next.js frontend fetches and displays these insights in real time.
- **PDF Generation:** On-demand PDF reports are generated either client-side (using libraries like `jsPDF`) or by invoking a Cloud Function for more complex reports.

---

## 🛠️ Setup and Installation

### Prerequisites

- Node.js (LTS version recommended)
- npm or Yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Firestore, Cloud Functions, and Hosting enabled

### Installation Steps

1. **Clone the repository:**
    ```bash
    git clone [Your Repository URL]
    cd [Your Project Folder Name]
    ```

2. **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Install Cloud Functions dependencies:**
    ```bash
    cd functions
    npm install
    # or
    yarn install
    cd ..
    ```

4. **Configure Firebase:**
    - Log in: `firebase login`
    - Initialize: `firebase init` (select Firestore, Functions, Hosting, and link to your project)
    - Ensure `firebase.json` is correctly configured.

5. **Set up environment variables:**
    - Create a `.env.local` file in the root directory.
    - Add your Firebase configuration (API keys, project ID, etc.) as environment variables.

6. **Deploy Cloud Functions (if required):**
    ```bash
    firebase deploy --only functions
    ```

7. **Run the application locally:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    - The app typically runs at [http://localhost:3000](http://localhost:3000).

---

## 💡 Usage

- **Real-time Readings:** On launch, the dashboard shows live air quality data.
- **Data Visualization:** Use the dropdown menu to switch between Line, Bar, and Heatmap visualizations.
- **Historical Data:** Select a date and time with the calendar picker to view past data.
- **AI Insights:** The "AI Analyzer" section details health impacts and recommended actions.
- **PDF Reports:** Click "Generate PDF Report" to download a summary of data and insights.
- **Theme Switching:** Click the gear icon (Settings) to toggle Dark/Light mode.
- **Conversational AI:** Use the chatbot to ask about air quality, health effects, and dashboard operation.

---

## 🤖 Reinforcement Learning Model

At the core of the AI Analyzer is a state-of-the-art Reinforcement Learning model, trained on large datasets of pollutant concentrations, health outcomes, and mitigation strategies. The model can:

- Interpret complex sensor data in real time.
- Predict potential health risks with high accuracy.
- Recommend optimal, context-aware interventions to improve air quality.

The RL model operates via Firebase Cloud Functions, ensuring scalable, efficient, and secure analysis without client-side computation.

---

## 🤝 Contributing

Contributions are welcome and appreciated! To contribute:

1. Fork the repository.
2. Create a feature branch:  
   `git checkout -b feature/YourFeature`
3. Commit your changes:  
   `git commit -m 'Add YourFeature'`
4. Push to the branch:  
   `git push origin feature/YourFeature`
5. Open a Pull Request describing your enhancement.

Alternatively, you can open an issue with the tag "enhancement" for suggestions and improvements.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---
