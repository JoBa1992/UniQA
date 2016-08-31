# UniQA
## ToDo
- module management
  1. As part of the add module workflow, offer the user the chance to create the module manually, or import the module as a CSV file - in a 2 column model/lightbox with icons and text to signify the action. (UX).
  2. import method has already been created, but it's done client side. We would probably be better pushing the file to api, let api deal with it and pass us back a data object with the information we want. Then we can send that information back on a create method.
  3. onSuccess of module creation, take tutor to newly created module (/module/:id)
  4. Add search/filter method to main management screen.
  5. Create view for individual module page, which allows user to:
    1. edit
    2. delete module (have to provide module ID name to confirm, like github)


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
