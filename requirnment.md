HOSAPP – Complete Product Blueprint
Vision
HOSAPP is an AI-powered Hospital Management System with Admin, Doctor, and Patient portals, enhanced by an AI voice assistant, digital medical records, appointment management, indoor navigation, and analytics.

User Roles
•	Patient: Authentication, dashboard, appointments, medical records, medicines, payments, reports, profile, AI voice assistant.
•	Doctor: Dashboard, patient management, consultation notes, prescriptions, lab orders, appointment management, availability.
•	Admin: Dashboard, user management, doctor & department management, appointments, inventory, pharmacy, laboratory, billing, analytics, notifications, settings.
Core Modules
•	Authentication & Role-Based Access
•	Appointment Management
•	Electronic Medical Records (EMR)
•	Prescription Management
•	Billing & Payments
•	Laboratory
•	Pharmacy
•	Inventory
•	Notifications
•	Analytics Dashboard
•	Emergency Module
•	Telemedicine
•	Hospital Indoor Navigation
•	AI Voice Assistant
AI Voice Assistant
•	Book appointments
•	Answer hospital FAQs
•	Read prescriptions
•	Medicine reminders
•	Hospital navigation
•	Report summaries
•	Emergency assistance
•	Doctor availability and queue status
Suggested Technology Stack
•	Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
•	Backend: NestJS (or Express), Node.js, TypeScript, Prisma
•	Database: PostgreSQL
•	Storage: AWS S3 / Cloudinary
•	Authentication: JWT + Refresh Tokens + OTP
•	Notifications: Firebase Cloud Messaging, Email, SMS
•	AI: OpenAI Speech-to-Text, Text-to-Speech, RAG
Major Database Tables
•	Users, Patients, Doctors, Admins, Departments, Appointments, MedicalRecords, Prescriptions, Medicines, PrescriptionItems, LabTests, Reports, Invoices, Payments, Notifications, Beds, Rooms, HospitalMap, Insurance, AuditLogs, Roles, Permissions
MVP Roadmap
•	Phase 1: Authentication, appointments, dashboards, EMR, notifications.
•	Phase 2: Lab, pharmacy, inventory, billing, analytics.
•	Phase 3: AI voice assistant, indoor navigation, telemedicine, predictive features.
Future Enhancements
•	AI symptom checker (with medical disclaimer)
•	AI diet planner
•	AI report summarization
•	Multi-hospital SaaS support
•	IoT integration for smart beds and devices
•	Advanced analytics and forecasting


•	Product Vision
•	HOSAPP is an AI-powered Hospital Management System that simplifies interactions between patients, doctors, and hospital administrators. The MVP demonstrates how AI and modern web technologies can improve patient care and hospital operations.
•	Target audience:
•	College project/demo 
•	Portfolio project 
•	Hackathons 
•	Internship/job interviews 
•	Potential SaaS MVP 
•	________________________________________
•	Scope (MVP)
•	Instead of trying to build 100+ features, focus on a polished set of core modules.
•	Roles
•	Patient
•	Doctor
•	Admin
•	________________________________________
•	Patient Features
•	Dashboard
•	Welcome card 
•	Upcoming appointment 
•	Health summary 
•	Prescription preview 
•	Notifications 
•	AI Voice Assistant 
•	________________________________________
•	Appointments
•	Book appointment 
•	Cancel appointment 
•	View appointments 
•	Filter by status 
•	________________________________________
•	Medical Records
•	Previous visits 
•	Reports 
•	Prescriptions 
•	Diagnoses 
•	________________________________________
•	AI Voice Assistant
•	Examples:
•	Book my appointment
•	Show my reports
•	Read my prescription
•	Where is Radiology?
•	Call emergency
•	________________________________________
•	Hospital Map
•	Interactive demo map
•	Departments
•	Reception 
•	Pharmacy 
•	Lab 
•	ICU 
•	Emergency 
•	Radiology 
•	Clicking one shows navigation.
•	________________________________________
•	Profile
•	Basic details
•	Emergency contact
•	Blood group
•	Insurance (demo)
•	________________________________________
•	Doctor Features
•	Dashboard
•	Today's appointments
•	Pending appointments
•	Recent patients
•	Quick statistics
•	________________________________________
•	Patient List
•	Search patient
•	Open profile
•	Medical history
•	Reports
•	________________________________________
•	Consultation
•	Diagnosis
•	Prescription
•	Notes
•	Follow-up
•	________________________________________
•	Appointment Management
•	Accept
•	Reject
•	Completed
•	________________________________________
•	Availability
•	Working hours
•	Available slots
•	________________________________________
•	Admin Features
•	Dashboard
•	Cards
•	Patients 
•	Doctors 
•	Appointments 
•	Revenue (demo) 
•	Beds Available 
•	Charts
•	Appointments
•	Departments
•	Patient Growth
•	________________________________________
•	User Management
•	CRUD
•	Patients
•	Doctors
•	Admins
•	________________________________________
•	Department Management
•	Cardiology
•	ENT
•	Neurology
•	Emergency
•	Pediatrics
•	Dermatology
•	________________________________________
•	Appointment Management
•	View all
•	Assign doctor
•	Cancel
•	Reschedule
•	________________________________________
•	Analytics
•	Appointments
•	Revenue (demo)
•	Department load
•	Doctor activity
•	________________________________________
•	AI Voice Assistant (Showcase Feature)
•	This is your USP.
•	Instead of a simple chatbot, create a voice-enabled assistant.
•	Example:
•	🎤
•	Patient:
•	"I have chest pain."
•	Assistant:
•	"I recommend booking a Cardiologist."
•	Show doctors
•	Book appointment
•	________________________________________
•	Patient
•	"When is my appointment?"
•	Assistant
•	"You have an appointment tomorrow at 10:30 AM."
•	________________________________________
•	Patient
•	"Take me to Pharmacy."
•	Assistant
•	Highlights Pharmacy on map.
•	________________________________________
•	AI Features
•	AI Report Summary
•	Upload PDF
•	↓
•	AI summarizes
•	↓
•	Simple language
•	________________________________________
•	AI Prescription Explanation
•	Explain medicine
•	Explain dosage
•	Side effects
•	________________________________________
•	AI FAQ
•	Hospital timings
•	Departments
•	Insurance
•	Emergency
•	________________________________________
•	Suggested Pages
•	Public
•	Landing Page
•	
•	About
•	
•	Departments
•	
•	Doctors
•	
•	Login
•	
•	Register
•	________________________________________
•	Patient
•	Dashboard
•	
•	Appointments
•	
•	Book Appointment
•	
•	Medical Records
•	
•	Reports
•	
•	Profile
•	
•	Hospital Map
•	
•	AI Assistant
•	________________________________________
•	Doctor
•	Dashboard
•	
•	Patients
•	
•	Appointments
•	
•	Consultation
•	
•	Availability
•	
•	Profile
•	________________________________________
•	Admin
•	Dashboard
•	
•	Doctors
•	
•	Patients
•	
•	Departments
•	
•	Appointments
•	
•	Analytics
•	
•	Settings
•	________________________________________
•	Database (MVP)
•	Users
•	
•	Patients
•	
•	Doctors
•	
•	Admins
•	
•	Departments
•	
•	Appointments
•	
•	MedicalRecords
•	
•	Prescriptions
•	
•	Medicines
•	
•	Reports
•	
•	Notifications
  



•	Design - 
<!DOCTYPE html>
•	
•	<html class="light" lang="en"><head>
•	<meta charset="utf-8"/>
•	<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
•	<title>HOSAPP | Clinical HMS Admin Dashboard</title>
•	<!-- Google Fonts & Material Symbols -->
•	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
•	<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
•	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet"/>
•	<!-- Tailwind CSS -->
•	<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
•	<script id="tailwind-config">
•	      tailwind.config = {
•	        darkMode: "class",
•	        theme: {
•	          extend: {
•	            "colors": {
•	                    "on-secondary": "#ffffff",
•	                    "surface-container-high": "#dce9ff",
•	                    "on-tertiary-fixed": "#002113",
•	                    "background": "#f8f9ff",
•	                    "on-primary-fixed": "#111c2d",
•	                    "secondary-container": "#39b8fd",
•	                    "on-tertiary-fixed-variant": "#005236",
•	                    "primary-container": "#1e293b",
•	                    "primary-fixed": "#d8e3fb",
•	                    "error": "#ba1a1a",
•	                    "on-background": "#0b1c30",
•	                    "on-primary-container": "#8590a6",
•	                    "on-surface-variant": "#45474c",
•	                    "surface-container-lowest": "#ffffff",
•	                    "inverse-on-surface": "#eaf1ff",
•	                    "secondary": "#006591",
•	                    "on-secondary-container": "#004666",
•	                    "surface-container-low": "#eff4ff",
•	                    "outline": "#75777d",
•	                    "surface-dim": "#cbdbf5",
•	                    "primary": "#091426",
•	                    "surface-container": "#e5eeff",
•	                    "secondary-fixed-dim": "#89ceff",
•	                    "surface-tint": "#545f73",
•	                    "surface-variant": "#d3e4fe",
•	                    "inverse-surface": "#213145",
•	                    "tertiary-container": "#00301e",
•	                    "on-secondary-fixed": "#001e2f",
•	                    "inverse-primary": "#bcc7de",
•	                    "secondary-fixed": "#c9e6ff",
•	                    "tertiary-fixed": "#6ffbbe",
•	                    "on-surface": "#0b1c30",
•	                    "surface-bright": "#f8f9ff",
•	                    "on-primary-fixed-variant": "#3c475a",
•	                    "surface": "#f8f9ff",
•	                    "tertiary": "#00190e",
•	                    "outline-variant": "#c5c6cd",
•	                    "on-tertiary": "#ffffff",
•	                    "on-error-container": "#93000a",
•	                    "on-primary": "#ffffff",
•	                    "on-secondary-fixed-variant": "#004c6e",
•	                    "primary-fixed-dim": "#bcc7de",
•	                    "on-error": "#ffffff",
•	                    "surface-container-highest": "#d3e4fe",
•	                    "on-tertiary-container": "#00a472",
•	                    "error-container": "#ffdad6",
•	                    "tertiary-fixed-dim": "#4edea3"
•	            },
•	            "borderRadius": {
•	                    "DEFAULT": "0.25rem",
•	                    "lg": "0.5rem",
•	                    "xl": "0.75rem",
•	                    "full": "9999px"
•	            },
•	            "spacing": {
•	                    "margin-desktop": "32px",
•	                    "base": "4px",
•	                    "xl": "32px",
•	                    "sm": "8px",
•	                    "md": "16px",
•	                    "xs": "4px",
•	                    "gutter": "24px",
•	                    "2xl": "48px",
•	                    "lg": "24px",
•	                    "margin-mobile": "16px"
•	            },
•	            "fontFamily": {
•	                    "display-lg": ["Inter"],
•	                    "body-lg": ["Inter"],
•	                    "label-sm": ["Inter"],
•	                    "body-md": ["Inter"],
•	                    "headline-lg-mobile": ["Inter"],
•	                    "headline-lg": ["Inter"],
•	                    "title-md": ["Inter"]
•	            },
•	            "fontSize": {
•	                    "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
•	                    "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
•	                    "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500"}],
•	                    "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
•	                    "headline-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
•	                    "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
•	                    "title-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}]
•	            }
•	          },
•	        },
•	      }
•	    </script>
•	<style>
•	      body {
•	        background-color: #f8f9ff;
•	        font-family: 'Inter', sans-serif;
•	      }
•	      .material-symbols-outlined {
•	        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
•	      }
•	      .soft-card {
•	        background: #ffffff;
•	        border-radius: 1rem;
•	        box-shadow: 0px 4px 20px rgba(30, 41, 59, 0.05);
•	        border: 1px solid #E2E8F0;
•	      }
•	      .ai-gradient {
•	        background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(57, 184, 253, 0.05) 100%);
•	        border: 1px solid rgba(99, 102, 241, 0.1);
•	      }
•	      .scrollbar-hide::-webkit-scrollbar {
•	        display: none;
•	      }
•	    </style>
•	</head>
•	<body class="flex min-h-screen overflow-hidden">
•	<!-- SideNavBar Shell -->
•	<aside class="docked left-0 h-screen w-64 bg-primary dark:bg-primary flex flex-col h-full py-md z-50 fixed md:relative transition-transform duration-300" id="sidebar">
•	<div class="px-lg mb-xl">
•	<h1 class="font-headline-lg text-headline-lg font-bold text-on-primary">HOSAPP</h1>
•	<p class="text-on-primary-container font-label-sm uppercase tracking-wider">Clinical HMS</p>
•	</div>
•	<nav class="flex-1 space-y-1 overflow-y-auto scrollbar-hide px-2">
•	<!-- Active: Dashboard -->
•	<a class="flex items-center px-4 py-3 text-on-secondary-container bg-secondary-container rounded-lg mx-2 my-1 transition-colors group" href="#">
•	<span class="material-symbols-outlined mr-3" data-icon="dashboard">dashboard</span>
•	<span class="font-body-md">Dashboard</span>
•	</a>
•	<!-- Inactive tabs -->
•	<a class="flex items-center px-4 py-3 text-on-primary-container hover:bg-on-primary-fixed-variant/10 rounded-lg mx-2 my-1 transition-colors group" href="#">
•	<span class="material-symbols-outlined mr-3" data-icon="person_2">person_2</span>
•	<span class="font-body-md">Patients</span>
•	</a>
•	<a class="flex items-center px-4 py-3 text-on-primary-container hover:bg-on-primary-fixed-variant/10 rounded-lg mx-2 my-1 transition-colors group" href="#">
•	<span class="material-symbols-outlined mr-3" data-icon="medical_services">medical_services</span>
•	<span class="font-body-md">Doctors</span>
•	</a>
•	<a class="flex items-center px-4 py-3 text-on-primary-container hover:bg-on-primary-fixed-variant/10 rounded-lg mx-2 my-1 transition-colors group" href="#">
•	<span class="material-symbols-outlined mr-3" data-icon="event">event</span>
•	<span class="font-body-md">Appointments</span>
•	</a>
•	<a class="flex items-center px-4 py-3 text-on-primary-container hover:bg-on-primary-fixed-variant/10 rounded-lg mx-2 my-1 transition-colors group" href="#">
•	<span class="material-symbols-outlined mr-3" data-icon="assignment">assignment</span>
•	<span class="font-body-md">EMR</span>
•	</a>
•	<a class="flex items-center px-4 py-3 text-on-primary-container hover:bg-on-primary-fixed-variant/10 rounded-lg mx-2 my-1 transition-colors group" href="#">
•	<span class="material-symbols-outlined mr-3" data-icon="medication">medication</span>
•	<span class="font-body-md">Pharmacy</span>
•	</a>
•	<a class="flex items-center px-4 py-3 text-on-primary-container hover:bg-on-primary-fixed-variant/10 rounded-lg mx-2 my-1 transition-colors group" href="#">
•	<span class="material-symbols-outlined mr-3" data-icon="biotech">biotech</span>
•	<span class="font-body-md">Lab</span>
•	</a>
•	<a class="flex items-center px-4 py-3 text-on-primary-container hover:bg-on-primary-fixed-variant/10 rounded-lg mx-2 my-1 transition-colors group" href="#">
•	<span class="material-symbols-outlined mr-3" data-icon="payments">payments</span>
•	<span class="font-body-md">Billing</span>
•	</a>
•	<a class="flex items-center px-4 py-3 text-on-primary-container hover:bg-on-primary-fixed-variant/10 rounded-lg mx-2 my-1 transition-colors group" href="#">
•	<span class="material-symbols-outlined mr-3" data-icon="analytics">analytics</span>
•	<span class="font-body-md">Analytics</span>
•	</a>
•	</nav>
•	<div class="mt-auto px-4 pt-4 border-t border-on-primary-fixed-variant/20">
•	<button class="w-full py-3 px-4 bg-error text-white rounded-lg font-bold flex items-center justify-center mb-4 active:scale-95 transition-transform">
•	<span class="material-symbols-outlined mr-2" data-icon="emergency">emergency</span>
•	                Emergency Entry
•	            </button>
•	<div class="space-y-1">
•	<a class="flex items-center px-4 py-2 text-on-primary-container hover:bg-on-primary-fixed-variant/10 rounded-lg transition-colors" href="#">
•	<span class="material-symbols-outlined mr-3" data-icon="settings">settings</span>
•	<span class="font-body-md">Settings</span>
•	</a>
•	<a class="flex items-center px-4 py-2 text-on-primary-container hover:bg-on-primary-fixed-variant/10 rounded-lg transition-colors" href="#">
•	<span class="material-symbols-outlined mr-3" data-icon="help_outline">help_outline</span>
•	<span class="font-body-md">Support</span>
•	</a>
•	</div>
•	<div class="mt-6 flex items-center px-2 py-3 bg-on-primary-fixed-variant/10 rounded-xl">
•	<img class="w-10 h-10 rounded-full object-cover" data-alt="A professional portrait of a chief hospital administrator in business attire, clean-cut, neutral background, sharp focus, professional headshot for a healthcare software user profile." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEPzVStpYMciSo19SBHbJtZSdoCubBlm5YVEKEW4tc1ebxiaiy9IWDk7a1zjFK6u_iDXXHQWhz7SrArN7Kbu01TcW74BnP5eSSST1NNvB0mSRvuFNkLqQ5T7dtLDT0aUj36AohU79oreGpUYwwMwhsnfJE8ma8fsX3aeUT-gv60Rhs_LJkHgzvZ6uJ21sbn8GZqRFVaY-Ygdcjz_D9a_J6nNcUKB9PT6KpRxRm8kL3iQPsld1G3jPB8Vs91rJToIFpSKpgUYNo4Q5x"/>
•	<div class="ml-3 overflow-hidden">
•	<p class="text-on-primary font-bold text-sm truncate">Admin Profile</p>
•	<p class="text-on-primary-container text-xs truncate">Chief Admin</p>
•	</div>
•	</div>
•	</div>
•	</aside>
•	<!-- Main Content Canvas -->
•	<main class="flex-1 flex flex-col h-screen overflow-hidden">
•	<!-- TopAppBar -->
•	<header class="flex justify-between items-center px-lg w-full sticky top-0 z-40 bg-surface-container-lowest dark:bg-surface-container-lowest h-20 shadow-sm">
•	<div class="flex items-center gap-4">
•	<button class="md:hidden p-2 text-on-surface" onclick="document.getElementById('sidebar').classList.toggle('-translate-x-full')">
•	<span class="material-symbols-outlined" data-icon="menu">menu</span>
•	</button>
•	<div class="relative max-w-md hidden sm:block">
•	<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
•	<input class="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg w-80 focus:ring-2 focus:ring-secondary text-on-surface" placeholder="Search patients, records, or staff..." type="text"/>
•	</div>
•	</div>
•	<div class="flex items-center gap-md">
•	<button class="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-fixed rounded-lg font-medium hover:bg-primary-fixed transition-all">
•	<span class="material-symbols-outlined text-secondary-container" data-icon="bolt">bolt</span>
•	                    AI Assistant
•	                </button>
•	<div class="flex items-center gap-sm">
•	<button class="p-2 rounded-full hover:bg-surface-container-low relative group transition-colors">
•	<span class="material-symbols-outlined text-on-surface-variant" data-icon="notifications">notifications</span>
•	<span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest"></span>
•	</button>
•	<div class="w-10 h-10 rounded-full overflow-hidden border border-outline-variant">
•	<img class="w-full h-full object-cover" data-alt="Close up photo of high-end medical equipment, bokeh background, cinematic lighting, surgical tools arranged on a sterile tray in a modern hospital setting, professional photography style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJZz_a6OCgYRnjorYmdLkiyRdzAQ60jAlM4NABSsUrWxFm_8S43Hxv2vvUVpWy_khnhALkAm9YV_acmxx6muDrXp-hRrlbcio3GL1IlcaWZ7rnK5bDs9PT0InRr3VkLxwAeR5ZPSCSk-Uad1XpdpEBn5fl2TEdVbt0h8IbAp8cGBvd8qy9TBmOt5x7HdNfzTgHt9vcc5dLhVgSVbB21GjcdQ93b9ErzH6kts1P7ZROYnxfk4E4XaLqB1UD6OzB-V_CU6Tf58U8LpyN"/>
•	</div>
•	</div>
•	</div>
•	</header>
•	<!-- Dashboard Content -->
•	<div class="flex-1 overflow-y-auto p-md lg:p-xl space-y-lg bg-background scrollbar-hide">
•	<!-- Summary Row -->
•	<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
•	<!-- Card 1: Patients -->
•	<div class="soft-card p-lg flex items-center justify-between">
•	<div>
•	<p class="text-on-surface-variant font-label-sm uppercase tracking-wide">Total Patients</p>
•	<h3 class="text-primary font-display-lg text-headline-lg mt-1">1,284</h3>
•	<div class="flex items-center text-tertiary-fixed-dim text-xs mt-2 font-medium">
•	<span class="material-symbols-outlined text-xs mr-1" data-icon="trending_up">trending_up</span>
•	<span>+4.2% from last week</span>
•	</div>
•	</div>
•	<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
•	<span class="material-symbols-outlined text-secondary text-3xl" data-icon="groups">groups</span>
•	</div>
•	</div>
•	<!-- Card 2: Appointments -->
•	<div class="soft-card p-lg flex items-center justify-between">
•	<div>
•	<p class="text-on-surface-variant font-label-sm uppercase tracking-wide">Today's Appts</p>
•	<h3 class="text-primary font-display-lg text-headline-lg mt-1">42</h3>
•	<div class="flex items-center text-on-primary-container text-xs mt-2 font-medium">
•	<span class="material-symbols-outlined text-xs mr-1" data-icon="schedule">schedule</span>
•	<span>8 pending check-ins</span>
•	</div>
•	</div>
•	<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
•	<span class="material-symbols-outlined text-secondary text-3xl" data-icon="calendar_today">calendar_today</span>
•	</div>
•	</div>
•	<!-- Card 3: Doctors -->
•	<div class="soft-card p-lg flex items-center justify-between">
•	<div>
•	<p class="text-on-surface-variant font-label-sm uppercase tracking-wide">Doctors Active</p>
•	<h3 class="text-primary font-display-lg text-headline-lg mt-1">18/24</h3>
•	<div class="flex items-center text-tertiary-fixed-dim text-xs mt-2 font-medium">
•	<span class="material-symbols-outlined text-xs mr-1" data-icon="check_circle">check_circle</span>
•	<span>6 on standby</span>
•	</div>
•	</div>
•	<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
•	<span class="material-symbols-outlined text-secondary text-3xl" data-icon="medical_services">medical_services</span>
•	</div>
•	</div>
•	<!-- Card 4: Revenue -->
•	<div class="soft-card p-lg flex items-center justify-between">
•	<div>
•	<p class="text-on-surface-variant font-label-sm uppercase tracking-wide">Weekly Revenue</p>
•	<h3 class="text-primary font-display-lg text-headline-lg mt-1">$48.2k</h3>
•	<div class="flex items-center text-tertiary-fixed-dim text-xs mt-2 font-medium">
•	<span class="material-symbols-outlined text-xs mr-1" data-icon="trending_up">trending_up</span>
•	<span>+12.5% efficiency</span>
•	</div>
•	</div>
•	<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
•	<span class="material-symbols-outlined text-secondary text-3xl" data-icon="payments">payments</span>
•	</div>
•	</div>
•	</section>
•	<!-- Central Grid -->
•	<section class="grid grid-cols-1 lg:grid-cols-3 gap-lg">
•	<!-- Today's Appointment Queue (2/3) -->
•	<div class="lg:col-span-2 soft-card overflow-hidden">
•	<div class="p-lg border-b border-outline-variant flex items-center justify-between">
•	<h4 class="text-primary font-title-md">Today's Appointment Queue</h4>
•	<button class="text-secondary text-sm font-medium hover:underline">View All</button>
•	</div>
•	<div class="overflow-x-auto">
•	<table class="w-full text-left">
•	<thead>
•	<tr class="bg-surface-container-low text-on-surface-variant text-xs font-bold uppercase tracking-wider">
•	<th class="px-lg py-3">Patient Name</th>
•	<th class="px-lg py-3">Time</th>
•	<th class="px-lg py-3">Doctor</th>
•	<th class="px-lg py-3">Status</th>
•	<th class="px-lg py-3">Action</th>
•	</tr>
•	</thead>
•	<tbody class="divide-y divide-outline-variant">
•	<tr class="hover:bg-secondary-container/5 transition-colors">
•	<td class="px-lg py-4">
•	<div class="flex items-center">
•	<div class="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs mr-3">JD</div>
•	<span class="font-medium text-on-surface">James D. Miller</span>
•	</div>
•	</td>
•	<td class="px-lg py-4 text-on-surface-variant font-body-md">09:30 AM</td>
•	<td class="px-lg py-4 text-on-surface-variant font-body-md">Dr. Sarah Jenkins</td>
•	<td class="px-lg py-4">
•	<span class="px-3 py-1 rounded-full text-xs font-semibold bg-tertiary-fixed/20 text-on-tertiary-fixed-variant">Confirmed</span>
•	</td>
•	<td class="px-lg py-4">
•	<button class="p-2 hover:bg-surface-container rounded-full text-secondary">
•	<span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
•	</button>
•	</td>
•	</tr>
•	<tr class="hover:bg-secondary-container/5 transition-colors">
•	<td class="px-lg py-4">
•	<div class="flex items-center">
•	<div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-bold text-xs mr-3">AR</div>
•	<span class="font-medium text-on-surface">Amara Rodriguez</span>
•	</div>
•	</td>
•	<td class="px-lg py-4 text-on-surface-variant font-body-md">10:15 AM</td>
•	<td class="px-lg py-4 text-on-surface-variant font-body-md">Dr. Michael Chen</td>
•	<td class="px-lg py-4">
•	<span class="px-3 py-1 rounded-full text-xs font-semibold bg-secondary-container/20 text-on-secondary-container">In Progress</span>
•	</td>
•	<td class="px-lg py-4">
•	<button class="p-2 hover:bg-surface-container rounded-full text-secondary">
•	<span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
•	</button>
•	</td>
•	</tr>
•	<tr class="hover:bg-secondary-container/5 transition-colors">
•	<td class="px-lg py-4">
•	<div class="flex items-center">
•	<div class="w-8 h-8 rounded-full bg-surface-dim text-on-primary-fixed-variant flex items-center justify-center font-bold text-xs mr-3">BT</div>
•	<span class="font-medium text-on-surface">Benjamin Thorne</span>
•	</div>
•	</td>
•	<td class="px-lg py-4 text-on-surface-variant font-body-md">11:00 AM</td>
•	<td class="px-lg py-4 text-on-surface-variant font-body-md">Dr. Sarah Jenkins</td>
•	<td class="px-lg py-4">
•	<span class="px-3 py-1 rounded-full text-xs font-semibold bg-outline-variant/30 text-outline">Waiting</span>
•	</td>
•	<td class="px-lg py-4">
•	<button class="p-2 hover:bg-surface-container rounded-full text-secondary">
•	<span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
•	</button>
•	</td>
•	</tr>
•	<tr class="hover:bg-secondary-container/5 transition-colors">
•	<td class="px-lg py-4">
•	<div class="flex items-center">
•	<div class="w-8 h-8 rounded-full bg-error-container text-on-error-container flex items-center justify-center font-bold text-xs mr-3">LW</div>
•	<span class="font-medium text-on-surface">Lisa Wong</span>
•	</div>
•	</td>
•	<td class="px-lg py-4 text-on-surface-variant font-body-md">11:45 AM</td>
•	<td class="px-lg py-4 text-on-surface-variant font-body-md">Dr. David Miller</td>
•	<td class="px-lg py-4">
•	<span class="px-3 py-1 rounded-full text-xs font-semibold bg-error-container text-error">Critical Delay</span>
•	</td>
•	<td class="px-lg py-4">
•	<button class="p-2 hover:bg-surface-container rounded-full text-secondary">
•	<span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
•	</button>
•	</td>
•	</tr>
•	</tbody>
•	</table>
•	</div>
•	</div>
•	<!-- AI Health Insights (1/3) -->
•	<div class="soft-card ai-gradient p-lg flex flex-col">
•	<div class="flex items-center justify-between mb-lg">
•	<div class="flex items-center gap-2">
•	<span class="material-symbols-outlined text-on-tertiary-container" data-icon="auto_awesome">auto_awesome</span>
•	<h4 class="text-primary font-title-md">AI Insights</h4>
•	</div>
•	<span class="px-2 py-1 bg-on-tertiary-container/10 text-on-tertiary-container text-[10px] font-bold uppercase rounded tracking-widest">Live</span>
•	</div>
•	<div class="space-y-md flex-1">
•	<!-- Insight Alert 1 -->
•	<div class="p-md rounded-xl bg-white border border-outline-variant/50 relative overflow-hidden group hover:border-secondary transition-colors cursor-pointer">
•	<div class="absolute top-0 left-0 w-1 h-full bg-error"></div>
•	<div class="flex justify-between items-start">
•	<h5 class="text-primary font-bold text-sm">Critical Capacity Warning</h5>
•	<span class="text-[10px] text-on-surface-variant">2m ago</span>
•	</div>
•	<p class="text-on-surface-variant text-xs mt-1 leading-relaxed">Bed capacity predicted to reach <span class="font-bold text-error">95%</span> in 4 hours based on ER admission rates.</p>
•	<button class="mt-3 text-secondary text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
•	                                view logistics <span class="material-symbols-outlined text-xs" data-icon="chevron_right">chevron_right</span>
•	</button>
•	</div>
•	<!-- Insight Alert 2 -->
•	<div class="p-md rounded-xl bg-white border border-outline-variant/50 relative overflow-hidden group hover:border-secondary transition-colors cursor-pointer">
•	<div class="absolute top-0 left-0 w-1 h-full bg-secondary-container"></div>
•	<div class="flex justify-between items-start">
•	<h5 class="text-primary font-bold text-sm">Lab Pending Summaries</h5>
•	<span class="text-[10px] text-on-surface-variant">15m ago</span>
•	</div>
•	<p class="text-on-surface-variant text-xs mt-1 leading-relaxed">Lab report summaries are pending for <span class="font-bold">5 patients</span> in Cardiology. AI summary ready for review.</p>
•	<button class="mt-3 text-secondary text-xs font-bold flex items-center gap-1">
•	                                batch review <span class="material-symbols-outlined text-xs" data-icon="chevron_right">chevron_right</span>
•	</button>
•	</div>
•	<!-- Insight Alert 3 -->
•	<div class="p-md rounded-xl bg-white border border-outline-variant/50 relative overflow-hidden group hover:border-secondary transition-colors cursor-pointer">
•	<div class="absolute top-0 left-0 w-1 h-full bg-tertiary-fixed-dim"></div>
•	<div class="flex justify-between items-start">
•	<h5 class="text-primary font-bold text-sm">Supply Reorder Optimization</h5>
•	<span class="text-[10px] text-on-surface-variant">1h ago</span>
•	</div>
•	<p class="text-on-surface-variant text-xs mt-1 leading-relaxed">Surgical glove usage spiked 12% above norm. Auto-adjusting next order to prevent stockout.</p>
•	</div>
•	</div>
•	<div class="mt-lg p-3 bg-primary-container text-on-primary-fixed rounded-lg text-center text-xs">
•	                        Refreshed data at 10:45 AM
•	                    </div>
•	</div>
•	</section>
•	<!-- Bottom Row -->
•	<section class="grid grid-cols-1 lg:grid-cols-2 gap-lg pb-xl">
•	<!-- Department Efficiency -->
•	<div class="soft-card p-lg">
•	<div class="flex items-center justify-between mb-lg">
•	<h4 class="text-primary font-title-md">Department Efficiency</h4>
•	<select class="bg-surface-container-low border-none rounded-lg text-xs font-medium focus:ring-0">
•	<option>Last 7 Days</option>
•	<option>Last 30 Days</option>
•	</select>
•	</div>
•	<div class="h-64 flex items-end gap-md px-4">
•	<!-- Bar Chart Placeholder -->
•	<div class="flex-1 flex flex-col items-center gap-2 group">
•	<div class="w-full bg-secondary-container/20 rounded-t-lg relative h-[80%] overflow-hidden">
•	<div class="absolute bottom-0 left-0 w-full bg-secondary transition-all duration-700 h-[65%]" style="height: 65%;"></div>
•	</div>
•	<span class="text-[10px] font-bold text-on-surface-variant">Cardio</span>
•	</div>
•	<div class="flex-1 flex flex-col items-center gap-2 group">
•	<div class="w-full bg-secondary-container/20 rounded-t-lg relative h-[80%] overflow-hidden">
•	<div class="absolute bottom-0 left-0 w-full bg-secondary transition-all duration-700 h-[85%]" style="height: 85%;"></div>
•	</div>
•	<span class="text-[10px] font-bold text-on-surface-variant">Pediat</span>
•	</div>
•	<div class="flex-1 flex flex-col items-center gap-2 group">
•	<div class="w-full bg-secondary-container/20 rounded-t-lg relative h-[80%] overflow-hidden">
•	<div class="absolute bottom-0 left-0 w-full bg-secondary transition-all duration-700 h-[45%]" style="height: 45%;"></div>
•	</div>
•	<span class="text-[10px] font-bold text-on-surface-variant">Ortho</span>
•	</div>
•	<div class="flex-1 flex flex-col items-center gap-2 group">
•	<div class="w-full bg-secondary-container/20 rounded-t-lg relative h-[80%] overflow-hidden">
•	<div class="absolute bottom-0 left-0 w-full bg-secondary transition-all duration-700 h-[92%]" style="height: 92%;"></div>
•	</div>
•	<span class="text-[10px] font-bold text-on-surface-variant">Neuro</span>
•	</div>
•	<div class="flex-1 flex flex-col items-center gap-2 group">
•	<div class="w-full bg-secondary-container/20 rounded-t-lg relative h-[80%] overflow-hidden">
•	<div class="absolute bottom-0 left-0 w-full bg-secondary transition-all duration-700 h-[70%]" style="height: 70%;"></div>
•	</div>
•	<span class="text-[10px] font-bold text-on-surface-variant">Physio</span>
•	</div>
•	<div class="flex-1 flex flex-col items-center gap-2 group">
•	<div class="w-full bg-secondary-container/20 rounded-t-lg relative h-[80%] overflow-hidden">
•	<div class="absolute bottom-0 left-0 w-full bg-secondary transition-all duration-700 h-[55%]" style="height: 55%;"></div>
•	</div>
•	<span class="text-[10px] font-bold text-on-surface-variant">ENT</span>
•	</div>
•	</div>
•	</div>
•	<!-- Recent System Activity -->
•	<div class="soft-card p-lg flex flex-col">
•	<h4 class="text-primary font-title-md mb-lg">Recent System Activity</h4>
•	<div class="space-y-md flex-1 overflow-y-auto pr-2 scrollbar-hide">
•	<div class="flex items-start gap-4">
•	<div class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
•	<span class="material-symbols-outlined text-secondary text-sm" data-icon="file_upload">file_upload</span>
•	</div>
•	<div>
•	<p class="text-sm text-on-surface"><span class="font-bold">Nurse Taylor</span> uploaded Lab Results for Patient #4429</p>
•	<span class="text-[10px] text-on-surface-variant">Today, 10:42 AM</span>
•	</div>
•	</div>
•	<div class="flex items-start gap-4">
•	<div class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
•	<span class="material-symbols-outlined text-secondary text-sm" data-icon="edit">edit</span>
•	</div>
•	<div>
•	<p class="text-sm text-on-surface"><span class="font-bold">Dr. Chen</span> updated treatment plan for Patient #1102</p>
•	<span class="text-[10px] text-on-surface-variant">Today, 09:15 AM</span>
•	</div>
•	</div>
•	<div class="flex items-start gap-4">
•	<div class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
•	<span class="material-symbols-outlined text-secondary text-sm" data-icon="vpn_key">vpn_key</span>
•	</div>
•	<div>
•	<p class="text-sm text-on-surface"><span class="font-bold">System</span> Security patch applied to EMR database</p>
•	<span class="text-[10px] text-on-surface-variant">Yesterday, 11:20 PM</span>
•	</div>
•	</div>
•	<div class="flex items-start gap-4">
•	<div class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
•	<span class="material-symbols-outlined text-secondary text-sm" data-icon="inventory">inventory</span>
•	</div>
•	<div>
•	<p class="text-sm text-on-surface"><span class="font-bold">Pharmacy</span> Inventory auto-replenishment order triggered</p>
•	<span class="text-[10px] text-on-surface-variant">Yesterday, 06:45 PM</span>
•	</div>
•	</div>
•	</div>
•	</div>
•	</section>
•	</div>
•	</main>
•	<!-- Floating Action Button (FAB) - Specific to Admin Entry -->
•	<button class="fixed bottom-8 right-8 w-14 h-14 bg-secondary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 md:hidden">
•	<span class="material-symbols-outlined text-2xl" data-icon="add">add</span>
•	</button>
•	<script>
•	        // Simple JS for interactivity
•	        const sidebar = document.getElementById('sidebar');
•	        // In a real app, logic would handle navigation states
•	        
•	        // Example: Highlight rows on click
•	        document.querySelectorAll('tbody tr').forEach(row => {
•	            row.addEventListener('click', () => {
•	                row.classList.toggle('bg-secondary-container/10');
•	            });
•	        });
•	    </script>
•	</body></html>

make sure use same design across overall app 





DB access -  
project URL - https://hvqwelodbfjedvpdmvbo.supabase.co
publishable key - sb_publishable_MaB0wdGmOu5DemBDAK2AgQ_cWevnOqm
direct connecting string - postgresql://postgres:[YOUR-PASSWORD]@db.hvqwelodbfjedvpdmvbo.supabase.co:5432/postgres
CLI setup command - supabase login
•	supabase init
•	supabase link --project-ref hvqwelodbfjedvpdmvbo
package install - npm install @supabase/supabase-js @supabase/ssr
.env.local - NEXT_PUBLIC_SUPABASE_URL=https://hvqwelodbfjedvpdmvbo.supabase.co
•	NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_MaB0wdGmOu5DemBDAK2AgQ_cWevnOqm
Install agent ( Optional ) - npx skills add supabase/agent-skills
pass- TKclowny@1612
