# Rule Engine with AST

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Project Overview

The **Rule Engine with AST** is a full-stack application designed to define, modify, and evaluate complex rules seamlessly. It leverages Abstract Syntax Trees (AST) to parse and manage rule expressions, allowing for dynamic rule manipulation and evaluation based on user data.

## Technologies Used

- **Backend:**
  - [Node.js](https://nodejs.org/) - JavaScript runtime environment.
  - [Express.js](https://expressjs.com/) - Web framework for Node.js.
  - [MongoDB](https://www.mongodb.com/) - NoSQL database for storing rules.
  - [Mongoose](https://mongoosejs.com/) - ODM for MongoDB.
  - [Docker](https://www.docker.com/) - Containerization platform.

- **Frontend:**
  - HTML5, CSS3, JavaScript - Core web technologies.
  - [Nginx](https://www.nginx.com/) - Web server for serving static files.
  - [Docker](https://www.docker.com/) - Containerization platform.

- **Other Tools:**
  - [JSEP](https://github.com/EricSmekens/jsep) - JavaScript Expression Parser.
  - [Docker Compose](https://docs.docker.com/compose/) - Tool for defining and running multi-container Docker applications.

## Why These Technologies

- **Node.js & Express.js:** Chosen for their non-blocking, event-driven architecture, which is ideal for building scalable network applications. Express.js provides a minimalistic and flexible framework for building robust APIs.

- **MongoDB & Mongoose:** MongoDB offers a flexible schema design, which is perfect for storing dynamic rule structures. Mongoose simplifies interactions with MongoDB by providing a straightforward schema-based solution.

- **Nginx:** Utilized for its high performance in serving static files, handling concurrent connections efficiently, and acting as a reverse proxy if needed in the future.

- **Docker & Docker Compose:** Docker ensures consistency across development and production environments by containerizing applications. Docker Compose simplifies the management of multi-container setups, making it easier to orchestrate both frontend and backend services.

- **JSEP:** Provides a robust way to parse and manipulate JavaScript expressions into ASTs, facilitating dynamic rule evaluations and modifications.


## Installation

You can set up and run the application either using Docker or without Docker, depending on your preference.

### **Prerequisites**

- **With Docker:**
  - [Docker](https://www.docker.com/get-started) installed on your machine.
  - [Docker Compose](https://docs.docker.com/compose/install/) installed.

- **Without Docker:**
  - [Node.js](https://nodejs.org/en/download/) (v14 or later).
  - [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) with a cluster set up.
  - A web browser to access the frontend.

### **1. Installation with Docker**

**Step 1: Clone the Repository**

```bash
git clone https://github.com/<your-username>/<repository-name>.git
cd <repository-name>
```
**Step 2: Build and Run Containers**

 - From the project root, execute:

```bash
docker-compose up --build
```
Detached Mode: To run containers in the background, add the -d flag.
```bash
docker-compose up --build -d
```
**Step 3: Access the Application**

  - Frontend: Open your browser and navigate to (http://localhost).
  - Backend API: Accessible at (http://localhost:3000/api/rules).
  - Note: Since the MongoDB connection string is hard-coded to use MongoDB Atlas, ensure that your Atlas cluster is accessible and properly configured.

### **2. Installation Without Docker**


**Step 1: Clone the Repository**

```bash
git clone https://github.com/<your-username>/<repository-name>.git
cd <repository-name>
```
 
**Step 2: Set Up the Backend**

 - Navigate to the Backend Directory:

```bash
cd backend
```
 - Install Dependencies:

```bash
npm install
```

 - Run the Backend Server:

```bash
node index.js
```
 - The backend server should now be running on http://localhost:3000.

**Step 3: Set Up the Frontend**

 - Open a New Terminal Window:

 - Ensure the backend server is running.
 - Navigate to the Frontend Directory:

```bash
cd frontend
```

 - Serve the Frontend Files:

 - Since the frontend is served using Nginx in the Docker setup, you'll need to serve it locally. You can use a simple HTTP server like serve or http-server.

 - Install http-server Globally:

```bash
npm install -g http-server
```
 - Run the Server:

```bash
http-server -p 8080
```

 - The frontend should now be accessible at http://localhost:8080.
 - Alternative: Open index.html directly in your browser, but some functionalities (like API calls) may not work due to CORS restrictions.

**Step 4: Access the Application**

 - Frontend: http://localhost:8080
 - Backend API: http://localhost:3000/api/rules

### **Usage**
### **Frontend**

**Define a Single Rule:**

 - Navigate to the Single Rule section.
 - Enter a rule name and rule string (e.g., age > 30 AND salary >= 50000).
 - Click Add Rule to save it.
   
**Evaluate User Data:**

 - Enter JSON-formatted user data (e.g., {"age": 35, "salary": 60000}).
 - Enter the rule name to evaluate against.
 - Click Evaluate to see if the user is eligible.

**Modify Existing Rules:**

 - Fetch and modify operators, operands, add or remove sub-expressions as needed.
 - Save changes to update the rule.
 - Combined Rules

**Define a Combined Rule:**

 - Navigate to the Combined Rule section.
 - Enter a combined rule name and multiple rule strings.
 - Choose an operator (AND/OR) to combine the rules.
 - Click Add Combined Rule to save it.

**Evaluate Combined Rules:**

 - Enter JSON-formatted user data.
 - Enter the combined rule name to evaluate against.
 - Click Evaluate to determine eligibility.

### **API Endpoints**
### **Rules**

**Create Rule**

```bash
POST /api/rules/create
```
**Body:**

 - json
```bash
{
  "name": "RuleName",
  "ruleString": "age > 30 AND salary >= 50000"
}
```
**Fetch Rule**

```bash
GET /api/rules/:name
```

**Modify Operator**

```bash
POST /api/rules/modifyOperator
```
**Body:**

 - json
```bash
{
  "name": "RuleName",
  "path": ["operatorPath"],
  "newOperator": "AND"
}
```
**Modify Operand Value**

```bash
POST /api/rules/modifyOperand
```
**Body:**

 - json
```bash
{
  "name": "RuleName",
  "path": ["operandPath"],
  "newValue": "35"
}
```
**Add Sub-expression**

```bash
POST /api/rules/addSubExpression
```
**Body:**

 - json
```bash
{
  "name": "RuleName",
  "path": ["expressionPath"],
  "newExpressionString": "salary > 50000",
  "operator": "AND"
}
```
 **Remove Sub-expression**

```bash
POST /api/rules/removeSubExpression
```
**Body:**

 - json
```bash
{
  "name": "RuleName",
  "path": ["expressionPath"]
}
```
**Evaluate Rule by Name**

```bash
POST /api/rules/evaluateByName
```
**Body:**

 - json
```bash
{
  "name": "RuleName",
  "userData": {
    "age": 35,
    "salary": 60000
  }
}
```

## **Combined Rules**
 **Create Combined Rule**

```bash
POST /api/multirules/create
```
**Body:**

 - json
```bash
{
  "name": "CombinedRuleName",
  "ruleStrings": [
    "age > 30",
    "salary >= 50000"
  ],
  "operator": "AND"
}
```
**Fetch Combined Rule**

```bash
GET /api/multirules/:name
```
**Modify Combined Operator**

```bash
POST /api/multirules/modifyOperator
```
**Body:***

 - json
```bash
{
  "name": "CombinedRuleName",
  "path": ["operatorPath"],
  "newOperator": "OR"
}
```
**Modify Combined Operand Value**

```bash
POST /api/multirules/modifyOperand
```
**Body:**

 - json
```bash
{
  "name": "CombinedRuleName",
  "path": ["operandPath"],
  "newValue": "40"
}
```
**Add Combined Sub-expression**

```bash
POST /api/multirules/addSubExpression
```
**Body:**

 - json
```bash
{
  "name": "CombinedRuleName",
  "path": ["expressionPath"],
  "newExpressionString": "experience >= 5",
  "operator": "AND"
}
```
**Remove Combined Sub-expression**

```bash
POST /api/multirules/removeSubExpression
```
**Body:**

 - json
```bash
{
  "name": "CombinedRuleName",
  "path": ["expressionPath"]
}
```
**Evaluate Combined Rule by Name**

```bash
POST /api/multirules/evaluateByName
```
**Body:**

 - json
```bash
{
  "name": "CombinedRuleName",
  "userData": {
    "age": 35,
    "salary": 60000,
    "experience": 6
  }
}
```

## **Contributing**
**Contributions are welcome! Follow these steps to contribute:**

- **1. Fork the Repository**
  - Click the Fork button at the top-right corner of this page.
  - Clone Your Fork

```bash
git clone https://github.com/<your-username>/<repository-name>.git
cd <repository-name>
```
- **2. Create a New Branch**

```bash
git checkout -b feature/YourFeatureName
```
- **3. Make Your Changes**
 - Implement your feature or bug fix.
 - Commit Your Changes

```bash
git commit -m "Add feature: YourFeatureName"
```
- **4. Push to Your Fork**

```bash
git push origin feature/YourFeatureName
```
- **5. Create a Pull Request**

 - Navigate to your repository on GitHub.
 - Click Compare & pull request.
 - Provide a descriptive title and description for your PR.
 - Submit the pull request.

## **License**

**This project is licensed under the MIT License.**

**Contact**
 - Author: Chayank Das
 - Email: chayankdas35@gmail.com
 - GitHub: https://github.com/<your-username>
