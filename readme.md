
 ██████╗ ██████╗  ██████╗ ██╗   ██╗██████╗ ███████╗██████╗ 
██╔════╝ ██╔══██╗██╔═══██╗██║   ██║██╔══██╗██╔════╝██╔══██╗
██║  ███╗██████╔╝██║   ██║██║   ██║██████╔╝█████╗  ██████╔╝
██║   ██║██╔══██╗██║   ██║██║   ██║██╔═══╝ ██╔══╝  ██╔══██╗
╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║     ███████╗██║  ██║
 ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝
                                                           
----------------------------------README----------------------------------
Welcome to Grouper! Follow these steps to run the grouper website on your
machine:

1.Install Dependencies (One Time Only)
	A. Navigate to the source directory
		..\Grouper
	B. Ensure Python environment is installed and properly configured
	C. Install dependencies
		pip install fastapi
		pip install motor
		pip install typing
		pip install google-auth
	D. Navigate to the Frontend directory
		cd grouper
	E. Install dependencies
		npm install --force

2. Start Backend
	A. Navigate to the src folder
		cd Backend/api/src
	B. Boot up the backend
		uvicorn main:app --reload --port 8000

3. Start Frontend
	A. Open new terminal in the source directory
	B. Navigate to the Frontend directory
		cd grouper
	C. Run webpage
		npm run dev
	D. Open webpage in browser
		http://localhost:3000


		