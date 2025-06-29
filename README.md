# 📖 Quran Monitoring App

An open-source web application to monitor students' Quran memorization (`Hafalan`) and Tilawati reading progress. Built with modern technologies including React, Vite, Tailwind CSS, and ShadCN UI.

---

## 🚀 Tech Stack

- ⚛️ React
- ⚡ Vite
- 💅 Tailwind CSS
- 🧩 shadcn-ui
- 🧠 TypeScript
- 🐘 Supabase (as backend)

---

## 🛠️ Getting Started

To run this project locally, make sure you have **Node.js** and **npm** installed.  
(We recommend using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/myzhaffar/quran-progress.git

# 2. Navigate into the project directory
cd quran-progress

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev

```

---

## 📊 Bulk Upload Students

The application now supports bulk uploading students via Excel or CSV files. This feature allows teachers to add multiple students at once instead of adding them individually.

### How to Use Bulk Upload

1. **Navigate to the Students page** or **Dashboard** (for teachers)
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
