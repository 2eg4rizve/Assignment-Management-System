# অ্যাসাইনমেন্ট ম্যানেজমেন্ট সিস্টেম — বাংলা নির্দেশিকা

## ১. প্রজেক্টটি কী?

অ্যাসাইনমেন্ট ম্যানেজমেন্ট সিস্টেম একটি ওয়েব অ্যাপ্লিকেশন, যার মাধ্যমে শিক্ষা প্রতিষ্ঠানের কোর্স, বিষয়, শিক্ষক, শিক্ষার্থী, অ্যাসাইনমেন্ট, সাবমিশন এবং ফলাফল একটি জায়গা থেকে পরিচালনা করা যায়।

সিস্টেমে তিন ধরনের ব্যবহারকারী রয়েছে:

- **Admin:** ব্যবহারকারী, কোর্স, বিষয়, শিক্ষক নিয়োগ এবং শিক্ষার্থী এনরোলমেন্ট পরিচালনা করেন।
- **Teacher:** অ্যাসাইনমেন্ট তৈরি ও প্রকাশ করেন, শিক্ষার্থীর উত্তর পর্যালোচনা করেন এবং নম্বর ও ফিডব্যাক দেন।
- **Student:** প্রকাশিত অ্যাসাইনমেন্ট দেখেন, উত্তর জমা দেন এবং প্রকাশিত নম্বর ও ফিডব্যাক দেখেন।

## ২. কেন এই প্রজেক্ট ব্যবহার করা প্রয়োজন?

প্রচলিত কাগজ, ইমেইল বা আলাদা স্প্রেডশিটে অ্যাসাইনমেন্ট পরিচালনা করলে তথ্য হারানো, সময়সীমা ভুলে যাওয়া, ভুল শিক্ষার্থীকে নম্বর দেওয়া এবং কাজের বর্তমান অবস্থা বুঝতে সমস্যা হয়। এই সিস্টেম ব্যবহারে:

- সব একাডেমিক তথ্য একটি কেন্দ্রীয় জায়গায় থাকে।
- প্রত্যেক ব্যবহারকারী নিজের ভূমিকা অনুযায়ী প্রয়োজনীয় সুবিধা পান।
- অ্যাসাইনমেন্টের সময়সীমা ও বর্তমান অবস্থা সহজে দেখা যায়।
- শিক্ষার্থীর সাবমিশন ও শিক্ষকের মূল্যায়নের ইতিহাস সংরক্ষিত থাকে।
- নম্বর ও ফিডব্যাক দ্রুত প্রকাশ করা যায়।
- অননুমোদিত ব্যবহারকারী সংরক্ষিত তথ্য বা অপারেশন ব্যবহার করতে পারেন না।
- Admin, Teacher এবং Student আলাদা dashboard থেকে প্রয়োজনীয় সারসংক্ষেপ পান।

## ৩. এই প্রজেক্ট দিয়ে কী কী করা যায়?

### Admin যা করতে পারেন

- Admin, Teacher ও Student account তৈরি এবং পরিচালনা করা।
- ব্যবহারকারীর তথ্য ও সক্রিয় অবস্থা পরিবর্তন করা।
- ব্যবহারকারীর password reset করা।
- Course তৈরি, দেখা এবং সম্পাদনা করা।
- Subject তৈরি, দেখা এবং সম্পাদনা করা।
- নির্দিষ্ট Course ও Subject-এর জন্য Teacher নিয়োগ করা।
- Student-কে Course-এ enroll করা।
- সব Assignment ও Submission পর্যবেক্ষণ করা।
- প্রতিষ্ঠানের সামগ্রিক dashboard summary দেখা।

### Teacher যা করতে পারেন

- নিজের Teaching Assignment অনুযায়ী Assignment তৈরি করা।
- Assignment draft হিসেবে রাখা অথবা সরাসরি publish করা।
- Assignment সম্পাদনা, publish এবং close করা।
- শিক্ষার্থীদের Submission তালিকা দেখা।
- জমা দেওয়া উত্তর review করা।
- Marks ও Feedback প্রদান করা।
- Grade publish করে Student-এর জন্য দৃশ্যমান করা।
- নিজের কাজের dashboard summary দেখা।

### Student যা করতে পারেন

- নিজের Course-এর published Assignment দেখা।
- Assignment-এর বিস্তারিত ও deadline দেখা।
- সময়সীমার মধ্যে উত্তর submit করা।
- অনুমতি থাকলে উত্তর পুনরায় submit করা।
- নিজের Submission-এর অবস্থা দেখা।
- প্রকাশিত Marks ও Teacher Feedback দেখা।
- upcoming, submitted এবং graded কাজের dashboard summary দেখা।

## ৪. সম্পূর্ণ Project Workflow

### ধাপ ১ — Admin একাডেমিক তথ্য প্রস্তুত করেন

1. Admin account দিয়ে login করেন।
2. প্রয়োজনীয় Teacher ও Student account তৈরি করেন।
3. Course তৈরি করেন।
4. Course-এর জন্য প্রয়োজনীয় Subject তৈরি করেন।
5. Teacher, Course এবং Subject নির্বাচন করে Teaching Assignment তৈরি করেন।
6. Student-কে সংশ্লিষ্ট Course-এ enroll করেন।

### ধাপ ২ — Teacher অ্যাসাইনমেন্ট তৈরি করেন

1. Teacher account দিয়ে login করেন।
2. **Assignments** থেকে **New assignment** নির্বাচন করেন।
3. নিজের Course ও Subject নির্বাচন করেন।
4. Title, Description, Deadline এবং Maximum Marks দেন।
5. প্রয়োজন হলে resubmission অনুমতি দেন।
6. Assignment draft হিসেবে save অথবা publish করেন।

### ধাপ ৩ — Student উত্তর জমা দেন

1. Student account দিয়ে login করেন।
2. **Assignments** থেকে প্রকাশিত Assignment খোলেন।
3. নির্দেশনা ও deadline পড়েন।
4. উত্তর লিখে submit করেন।
5. সিস্টেম Submission-এর সময় ও বর্তমান status সংরক্ষণ করে।

### ধাপ ৪ — Teacher মূল্যায়ন করেন

1. Teacher সংশ্লিষ্ট Assignment-এর Submission তালিকা খোলেন।
2. নির্দিষ্ট Student-এর উত্তর review করেন।
3. Maximum Marks-এর মধ্যে প্রাপ্ত নম্বর দেন।
4. প্রয়োজনীয় Feedback লিখেন।
5. Grade publish করেন।

### ধাপ ৫ — Student ফলাফল দেখেন

1. Student **Submissions** থেকে নিজের Submission খোলেন।
2. Submission status দেখেন।
3. প্রকাশিত Marks ও Feedback দেখেন।

সংক্ষেপে সম্পূর্ণ প্রবাহ:

```text
Admin setup
    → Teacher assignment তৈরি ও publish
    → Student উত্তর submit
    → Teacher review ও grade
    → Student marks ও feedback দেখে
```

## ৫. Project চালানোর ধাপ

### প্রয়োজনীয় সফটওয়্যার

- .NET 9 SDK
- PostgreSQL
- Node.js ও npm
- Visual Studio অথবা Visual Studio Code

### Backend চালানো

Visual Studio থেকে `AssignmentManagement.Api` startup project নির্বাচন করে Run করুন। Development environment-এ Swagger খুলবে:

```text
https://localhost:7096/swagger
```

Command Prompt থেকে চালাতে চাইলে:

```bat
cd /d "E:\Assignment Management System"
dotnet run --project backend\src\AssignmentManagement.Api
```

API run করার আগে PostgreSQL চালু থাকতে হবে এবং local User Secrets-এ সঠিক connection string থাকতে হবে।

### Frontend চালানো

নতুন Command Prompt খুলে চালান:

```bat
cd /d "E:\Assignment Management System\frontend"
copy /Y .env.example .env.local
set "PATH=E:\Assignment Management System\.tools\node-v24.18.1-win-x64;%PATH%"
npm.cmd install
npm.cmd run dev
```

তারপর browser-এ খুলুন:

```text
http://localhost:3000
```

## ৬. Demo Login

সব demo account-এর password:

```text
Demo123!
```

| ভূমিকা | Email |
|---|---|
| Admin | `admin@assignment.local` |
| Teacher | `teacher@assignment.local` |
| Student | `student@assignment.local` |

## ৭. Swagger দিয়ে API ব্যবহার

1. `https://localhost:7096/swagger` খুলুন।
2. `POST /api/v1/auth/login` endpoint খুলুন।
3. Demo email ও password দিয়ে **Execute** করুন।
4. Response থেকে `accessToken` copy করুন।
5. Swagger-এর **Authorize** button নির্বাচন করুন।
6. Token paste করে authorize করুন।
7. ব্যবহারকারীর role অনুযায়ী প্রয়োজনীয় endpoint execute করুন।

## ৮. নিরাপত্তা ও গুরুত্বপূর্ণ নিয়ম

- Admin-only operation Teacher বা Student ব্যবহার করতে পারেন না।
- Teacher শুধু নিজের Teaching Assignment-এর কাজ পরিচালনা করতে পারেন।
- Student শুধু নিজের Course-এর Assignment ও নিজের Submission ব্যবহার করতে পারেন।
- Password এবং database connection string Git repository-তে রাখা উচিত নয়।
- Assignment ও Submission update করার সময় সর্বশেষ `rowVersion` ব্যবহার করা হয়, যাতে একই তথ্য একাধিক ব্যক্তি পরিবর্তন করলে conflict শনাক্ত করা যায়।
- Production environment-এ demo accounts ও development password পরিবর্তন বা নিষ্ক্রিয় করতে হবে।

## ৯. সাধারণ সমস্যা ও সমাধান

### PostgreSQL password authentication failed

Local User Secrets-এ সঠিক connection string সেট করুন এবং API rebuild করুন।

### DLL বা EXE অন্য process ব্যবহার করছে

চলমান `AssignmentManagement.Api` process বা Visual Studio debug session বন্ধ করে আবার build করুন।

### Command Prompt-এ `Copy-Item` কাজ করছে না

`Copy-Item` PowerShell command। Command Prompt-এ ব্যবহার করুন:

```bat
copy /Y .env.example .env.local
```

### `npm` পাওয়া যাচ্ছে না

Command Prompt-এ local Node.js path যোগ করুন:

```bat
set "PATH=E:\Assignment Management System\.tools\node-v24.18.1-win-x64;%PATH%"
```

## ১০. সারসংক্ষেপ

এই প্রজেক্ট একটি সম্পূর্ণ role-based academic assignment workflow প্রদান করে। Admin একাডেমিক কাঠামো প্রস্তুত করেন, Teacher কাজ প্রকাশ ও মূল্যায়ন করেন এবং Student উত্তর জমা দিয়ে ফলাফল দেখেন। Backend API, PostgreSQL database এবং Next.js frontend একসঙ্গে কাজ করে পুরো প্রক্রিয়াটি নিরাপদ, অনুসরণযোগ্য এবং সহজে পরিচালনাযোগ্য করে।
