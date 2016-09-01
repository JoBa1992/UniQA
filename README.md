# UniQA
## ToDo
- all app
    1. Remove HashedPasswords/salts being leaked across by accident...


- module management (Josh)
    1.	import method has already been created, but it's done client side. We would probably be better pushing the file to node, let node deal with it and pass us back a data object with the information we want. Then we can send that information back on a create method.
    2.	manual creation method
        -	Need to search for tutors and do a typeahead
        -	Need to think of a way to create students bit by bit
    3.	onSuccess, take tutor to newly created module
    4.	Add search/filter method to main management screen.
    5.	Create view for individual module page, which allows user to:
        -	edit
        -	delete module (have to provide module ID name to confirm, like github)


- lecture management (tile/list view)
  1. List/Tile view, with module separated lectures (e.g. CSSD, week 1, week 2, week 3, MAD, week 1, week 2, week 3, etc.)
  2. File System needs hooking up to AWS (with a whitelist), and resource location references saving inside our db
  3. put lecture against module? So lectures can be categorized on this view, and gives a clear indication of what lectures are taught against.


- Start Session
  1. search dropdown for modules, must have tutor as part of the module
  2. search dropdown for lectures, must be created by user, or have user as a collaborator
  3. runtime, slider default to 1hour, increments in 30 mins, min: 30 mins, max: 12hours
  4. setup api to handle questions enable disable, and feedback enable disable


- Admin account type
  1. no session start page
  2. user management page
  3. module management page, no restriction to view
  4. lecture management page, no restriction to view
  5. no stats page
  6. application constant management page


- Need to send email to user when user is created via admin creation
  1. Send across a URL which directs user to set a password. If they try accessing the website without changing their password they will be directed to the new page...


- New account login page
  1. Change password validation
  2. Change any details
  3. Upload/Remove picture


- Account Details change
  1. Change Name
  2. Change Password
  3. Upload/Remove


## App workflow
    1. Tutor logs in (with valid details)
        -   if user hasn't logged in before they are taken to a set password page
        -   if user has logged in, they're taken to the dashboard

    2. Tutor navigates to Modules page to setup a module
        -   tutor can import csv file
        -   tutor can manually input module details and students
        -   tutor doesn't have access to manage individual students. Instead the API recognises when there is a new student being created inside a module. If the student already exists, they're referenced against this module, avoiding duplication

    3. Tutor navigates to Lecture page
        -   tutor can create a lecture
            -   tutor can add attachments against this lecture
                -   attachments are to be uploaded to S3
            -   a url can be provided with the lecture which allows a website slideshow can be done alongside a session.
            -   (future) a ppt file can be provided, and encoded into a web presentation
            -   Collaborators can be added against lectures, which will make the lecture show up in the collaborators lecture list.
            -   Lectures only show up in the list if the lecture is created by the logged in tutor, or if the logged in tutor is a collaborator on a lecture.
        -   tutor can update a lecture
            -   tbc...
        -   Tutor can delete a lecture if they've created it
        -   Tutor can unlink a lecture (remove themselves as a collaborator) if they're set as a collaborator

    4. Tutor navigates to Start Session page
            -   tbc...

    5. Tutor navigates to Statistics Page
            -   tbc...
