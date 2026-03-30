PUBLIC
│
├── Landing (/)
│   ├── Features
│   ├── Simulation
│   ├── Learn
│   ├── Login (/login)
│   └── Register (/register)
│
├── Login (/login)
│   ├── Forgot Password (/forgot-password)
│   └── → Dashboard (success)
│
├── Register (/register)
│   └── → Dashboard (success)
│
├── Forgot Password (/forgot-password)
│   └── Reset Password (/reset-password)
│
└── Reset Password (/reset-password)



APP (AUTHENTICATED)
│
├── Dashboard (/dashboard)
│
├── Markets (/markets)
│   └── Asset Detail (/markets/:asset)
│        └── Chart (in page)
│
├── Simulation (/simulation)
│   └── Trade Execution
│
├── Portfolio (/portfolio)
│
├── Trade History (/trade-history)
│
├── Learn (/learn)
│   └── Course Detail (/learn/:course)
│        └── Lesson (/learn/:course/:lesson)
│
├── Progress (/progress)
│
├── Profile (/profile)
│
└── Settings (/settings)