1. Deployment Instructions
	•	Clone the repository from GitHub:




	•	Install dependencies:

        #npm install


	•	Set up environment variables (e.g., for database, API keys) in a .env file:




	•	Seed the database with mock data:

       #npx prisma migrate dev --name init
       #npx prisma db seed


	•	Run the development server:

       #npm run dev


	•	The app is deployed on Vercel, and all code is pushed to GitHub.

⸻

2. Tech Decisions
	•	Next.js App Router: Chosen for its built-in support for server-side rendering (SSR) and file-based routing, making it ideal for modern full-stack apps.
	•	Tailwind CSS: Used for rapid UI development and consistent styling across components.
	•	Prisma: Simplifies database access with a type-safe ORM and easy schema migrations.
	•	PostgreSQL via Supabase: Provides a hosted, scalable relational database with great developer tooling and compatibility with Prisma.
	•	Vercel: Enables seamless deployment and is optimized for Next.js applications.

⸻

3. If I Had More Time…
	•	Connect the incident timeline to a video player so that toggling an incident plays the corresponding video footage.
	•	Improve the UI/UX for a more polished and interactive experience.
	•	Add real-time video playback capabilities with event syncing.
	•	Implement auth and role-based access for managing incidents.
	•	Write tests for better reliability and future scalability.

⸻

