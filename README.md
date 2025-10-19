# 📖 Mutabaahly - Quran Monitoring App

An open-source web application to monitor students' Quran memorization ([Tahfidz](file:///Users/myzhaffar/mutabaahly/src/utils/quranData.ts#L14-L14)) and Tilawati reading progress. Built with modern technologies including Next.js, React, Tailwind CSS, and ShadCN UI.

**Mutabaahly** (Arabic: متابعة) means "following up" or "monitoring" - reflecting the app's purpose of tracking Quran study progress.

---

## 🚀 Tech Stack

- ⚛️ **Next.js 14** - React framework with App Router
- ⚛️ **React 18** - UI library
- 💅 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **ShadCN UI** - Reusable component library
- 🧠 **TypeScript** - Type safety
- 🐘 **Supabase** - Backend-as-a-Service (Database, Auth, Storage)
- ⚡ **Vercel** - Deployment platform
- 🔄 **React Query** - Server state management
- 📊 **Recharts** - Data visualization

---

## 🛠️ Getting Started

To run this project locally, make sure you have **Node.js** and **npm** installed.  
(We recommend using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/myzhaffar/mutabaahly.git

# 2. Navigate into the project directory
cd mutabaahly

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be available at 'https://mutabaahly.com'.

### Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

---

## 👥 User Roles

The application supports two main user roles:

### Teacher
- Manage multiple classes and students
- Add/Edit/Delete students
- Track Tahfidz and Tilawati progress
- Generate progress reports
- Bulk upload students via CSV/Excel

### Parent
- View their children's progress
- Monitor memorization and reading achievements
- Access detailed progress reports

---

## 📊 Bulk Upload Students

The application supports bulk uploading students via Excel or CSV files. This feature allows teachers to add multiple students at once instead of adding them individually.

### How to Use Bulk Upload

1. **Navigate to the Students page** (for teachers)
2. **Click the "Bulk Upload" button** next to the "Add Student" button
3. **Download the template** to see the required format
4. **Prepare your file** with the following columns:
   - `name` (required): Student's full name
   - `group_name` (required): Class or group name
   - `teacher` (required): Teacher's name (must match existing teachers in the system)
   - `grade` (optional): Student's grade level

### File Format Requirements

- **Supported formats**: CSV, XLSX, XLS
- **Header row**: Must include column names
- **Data validation**: The system validates all data before upload
- **Teacher validation**: Teacher names must match existing teachers in the system

### Example CSV Format

```csv
name,group_name,teacher,grade
Ahmad Ali,Class A,Ustaz Ahmad,Grade 1
Fatima Zahra,Class B,Ustazah Sarah,Grade 2
Muhammad Hassan,Class A,Ustaz Ahmad,Grade 1
```

### Features

- ✅ **File validation**: Checks file format and data integrity
- ✅ **Data preview**: Shows a preview of the data before upload
- ✅ **Error reporting**: Displays specific validation errors with row numbers
- ✅ **Progress tracking**: Shows upload progress with success/failure counts
- ✅ **Batch processing**: Uploads students in batches for better performance
- ✅ **Template download**: Provides a downloadable template file

### Validation Rules

- Student names must be at least 2 characters long
- Group/Class names are required
- Teacher names must exist in the system
- All required fields must be filled

---

## 🔐 Authentication & Authorization

The app uses Next.js middleware for server-side authentication and route protection:

- **Server-side protection** - routes are protected before rendering
- **Role-based access control** - Teachers and parents have different permissions
- **No flash of unauthorized content** - better user experience
- **Centralized auth logic** - easier to maintain

### Authentication Flow

1. **Unauthenticated user** → redirected to `/auth`
2. **Authenticated user without role** → redirected to `/select-role`
3. **Role-specific route protection** - Teachers/Parets can only access their respective routes

---

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── contexts/            # React context providers
├── hooks/               # Custom React hooks
├── integrations/        # Third-party service integrations
├── lib/                 # Utility libraries
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
└── ...
```

---

## 🚀 Deployment

The app is configured for easy deployment on Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Set the environment variables in Vercel dashboard
4. Deploy!

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source. See [package.json](package.json) for details on individual package licenses.