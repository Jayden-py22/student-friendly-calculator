# student-friendly-calculator
A student-friendly, customizable calculator web app (C# ASP.NET)
## Team Members
* Adam Sheridan
* Allyn Crane
* Connor Butterfield
* Jayden Chen
* Kolton Law
* Nathaniel Dodson
* Yucheol Son
## Software Description
The Student Friendly Calculator is a web app (opened using a compatible browser) powered by C# ASP.NET. Alongside default calculator functionality, it provides the option to use different types of calculators (scientific, programming, etc.) featuring alternative buttons and functions that users can switch between based on their needs. A history tab allows users to import the result of previous calculations, which is saved through localStorage user's browser for future reference.
## Architecture
Programming Language: C# (through ASP.NET), HTML, CSS, JS
Framework: Web App through C# ASP.NET Core Web App
Data Storage: Render for hosting, cookies on browser stored by website
Development Tools: Visual Studio Code, Visual Studio, .NET 8 SDK, GitHub (project storage)
## Software Features
* [X] Fully styled website that opens in a web browser (whether on mobile or desktop)
* [X] Calculator functions (add, subtract, divide, multiply, etc.)
* [X] A calculator tab for switching between different calculators (basic, scientific, unit, programmer, etc.)
* [X] A history tab for reusing results of previous calculations
* [X] Stores history (previous operations, numbers, etc.) and other preference data to the user's computer using cookies
* [X] Handles calculation using C# with website functions handled using JS
## Team Communication
Team communication is conducted through a team Discord server in addition to a SMS group chat.
## Team Responsibility
|Responsibility                      |Team Member(s)              |
|------------------------------------|----------------------------|
|Conducting Meetings                 |Adam Sheridan|
|Maintaining Team Assignment List    |Kolton Law|
|Ensuring GitHub is Working          |Jayden Chen|
|Maintaining Documentation           |Connor Butterfield|
|Create & Display Presentations      |Yucheol Son, Allyn Crane|
|Submit Team Assignments             |Nathaniel Dodson|
## Reflections
During our meeting, we identified the following things that went well:
* We had little to no conflict with our project; everyone was generally on the same page and discussions were level-headed, allowing for a generally smooth and effective development process
* There was a widespread willingness to collaborate and find personal specializations​, as well as assist others in their code or tasks to ensure the project met the light of day
* The self-led learning process (on trying to understand ASP.NET and how the JavaScript and C# worked with each other) went really well, and was accelerated by the addition of libraries like NCalc to help us further understand the framework of what we were building
That being said, there were also some challenges and issues that cropped up, notably:
* Due to our development process, multiple different calculators were being developed at once, which led to differing implementations depending on the calculator in question. This led to issues later down the line when attempting to unify all the features into one page
* Mobile view was mostly completed, but due to CSS being worked on at the same time, broke other features and still needs to be fully reintegrated with the new design direction (and across all pages)
* Some additional features of a few set calculators (specifically, the unit converter and programming calculator) still need additional features to be fully functional. Lack of implementation was mostly due to unexpected complications in development and time constraints
