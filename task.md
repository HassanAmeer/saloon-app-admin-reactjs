



You are an expert React + Firebase developer. please update or restore existing project features according to requirements.

There are EXACTLY TWO admin panels / dashboards:

1. Super Admin Panel (platform owner — highest level)
route should be /super
2. Salon Manager Panel (each salon owner/manager — created only by Super Admin)
route should be /manager

  - just for login by these 2 routes can only . 

the existing panel should convert into saloon manager panel 





### 1st is salon manager .
* the existing others things same but should update the ui and flow  *

-- Side Bar 
 - Dashboard
 - Stylists 
    - Stylists: list of stylist and analytics
       - clients:
         - each stylist have multiple clients and sales and ai recommendations
         - clients list of each stylist
         - sales list of each stylist
         - ai recommendations list of each clients
         - stylist profile
 - Products
 - Sales & Analytics
 - Profile
 - App Config
 - Settings
     -- Privacy Policy & Terms & Conditions
     -- Support Settings

*How stylist will work*
- the salon manger creates a multiple stylists and. stylist can have multiple clients and sales and ai recomendation. 


- stylist page :
same existing features the saloon manager can create multiple stylists and each stylist have own profile and can update her profile and also can upload her skills bio name email phone number and password from profile page of each selectd saloon manager. active in active . how much clients and how sold products and how much scans . and in table also its name email and phone number and active status and stylist id . but if click to view then should also show more details and charts  and. analytics and clients + sold products of each clients tables. and  also client data can be updated by saloon manager. ai recomendations with each stylist when selected 

- Sales Tracking in saloon manger page: 
make sure saloon manager can Monitor and analyze sales performance of stylists and how much stylists have and how much products sold and how much products revenue and total sales and how much cleints under each stylist . in analytics and box cards stylist or any thats greate ui. and then also make a table of cleints names list its name from stylist name and how much products sales and quantity , date time, amount session id. also on click on stylist name can see the details of each stylist analytics 


### 2nd: super admin can create multiple saloon manger with email and password just. 
and saloon manager inside can upload her skills bio name email phone number and password from profile page of each selectd saloon manager. 
and all other also can super admin can watch and update every thing  like he can select each saloon manger  and same see all things and managements how much stylist have and how much each stylist have clients and products and each stylist analytics every things.
and also each saloon manager how much have stylist and sales and products and questions and hair types added.

*** by defaults things: when super admin create saloon manager ***
- same all saloon manager panel all features + super admin can create new saloon manager with email and password , name, profile image, phone number, bio, skills, active status+ can update own profile. 

- defaults data when super admin create saloon manager for saloon manager quicly setup: 
    - when super admin create saloon manager then in contact support should have the default email is saloon@manager.com, and phone number is +0123456789  will be adding. 
    - first 2 products will be added for each saloon manager when created by super admin. (1. Argan Oil Elixir. 2. Silver Bright Shampoo). 
    - and default same existing Questionnaire
    - default same existing Hair Types, Hair Conditions ,  Hair Scan Metrics also same existing as default data 
    - default same existing Visual Hair Colors existing data as default

*** also default data for migration into database should also add in data-migration.mockData.js file well structured and when /seeding route then also can migrate the data collections and documents added in firebase ***
- also when migration then super admin default login should be admin@gmail.com, password should be 12345678 
