What is AC?



By Daniel Garber
Jul 27, 2017

25

Add a reaction
Legacy editor
AC stands for Account Config. Almost every configuration in a Live Engage account is stored in an AC service, such as campaigns and engagements. Some examples:

Campaigns - stores the campaign information
Engagements - stores the engagements information (such as which engagement it is, how it looks, which window it opens)
Window conf - stores the window configuration - theme, which surveys are used
Goals, LOB (Line Of Business), Visitor Profile, Visitor Behavior - more configurations for tracking, monitoring and identifying the relevant visitors
Predefined Content, Categories - ready messages for the agent to send the visitor, and their division into categories
Users, Skills - The Users and Skills defined in LE
And many more.

Most AC services are accessible via the LE UI in the Campaigns/Users tabs or in Night Vision.

In VX the most relevant AC data is the Engagement and the Window conf.

The AC Engagement data dictates how the Engagement (offer) on the visitor page will look (and what type of offer it is), and which window configuration will be used for the chat/conversations when it's opened.

The AC Window conf data dictates how the window will look (theme) and which surveys are used.



Description

Create an Engagement Request for a specific account and campaign.

URI

/api/account/{accountId}/configuration/le-campaigns/campaigns/{campaignId}/engagements

HTTP method

POST

Response codes

CREATED(201, "Created"),
BAD_REQUEST(400, "Bad Request"),
UNAUTHORIZED(401, "Unauthorized"),
FORBIDDEN(403, "Forbidden"),
NOT_FOUND(404, "Not Found"),
NOT_ACCEPTABLE(406, "Not Acceptable"),
CONFLICT(409, "Conflict"),
GONE(410, "Gone"),
PRECONDITION_FAILED(412, "Precondition Failed"),
UNSUPPORTED_MEDIA_TYPE(415, "Unsupported Media Type"),
INTERNAL_SERVER_ERROR(500, "Internal Server Error"),
SERVICE_UNAVAILABLE(503, "Service Unavailable");

Formats

JSON.

Path parameters

accountId

campaignId

Query parameters

v
fields
field_set

Request headers

Authorization

Request body

 



{
    "deleted": false,
    "id": 3571998410,
    "name": "Engagement 1",
    "description": "Engagement 1 Description",
    "modifiedDate": "2019-07-31 12:46:15",
    "createdDate": "2019-07-31 12:46:15",
    "channel": 1,
    "type": 13, //App Install
    "onsiteLocations": [
        3484188010
    ],
    "visitorBehaviors": [
        3484187910
    ],
    "enabled": true,
    "language": "en-US",
    "displayInstances": [
        {
            "displayInstanceType": 5,
            "enabled": true
        }
    ],
    "timeInQueue": 0,
    "isPopOut": false,
    "isUnifiedWindow": false,
    "appInstallationId": "2d78cdc8-b1d7-4da2-a38d-74dd6d564d38",
    "useSystemRouting": false,
    "allowUnauthMsg": true,
    "zones": [],
    "subType": 34, //App Install
    "source": 12, //App Install
    "connectorId": 3484210010,
    "availabilityPolicy": 0,
    "renderingType": 0,
    "conversationType": 1
}
 

 

Description

Update a specific campaign for a specific account and publish 

URI

api/account/{accountId}/configuration/le-campaigns/campaigns/{campaignId}

HTTP method

PUT

Response codes

OK(200, "OK"),
BAD_REQUEST(400, "Bad Request"),
UNAUTHORIZED(401, "Unauthorized"),
FORBIDDEN(403, "Forbidden"),
NOT_FOUND(404, "Not Found"),
NOT_ACCEPTABLE(406, "Not Acceptable"),
CONFLICT(409, "Conflict"),
GONE(410, "Gone"),
PRECONDITION_FAILED(412, "Precondition Failed"),
UNSUPPORTED_MEDIA_TYPE(415, "Unsupported Media Type"),
INTERNAL_SERVER_ERROR(500, "Internal Server Error"),
SERVICE_UNAVAILABLE(503, "Service Unavailable");

Formats

JSON.

Path parameters

accountId

campaignId

Query parameters

v
fields
field_set

Request headers

Authorization

If-Match (the latest revision_num should be written)

Request body

 



{
    "name": "Proactive_Campaign_Creation_5",
    "description": "Create and Publish Proactive Campaign v5",
    "type": 1,
    "startDate": "2019-07-16 00:00:00",
    "priority": 0.5,
    "weight": 0.2,
    "controlGroup": {
        "percentage": 0
    },
    "status": 1,
    "engagements": [],
    "engagementIds": [3551297010],
    "timeZone": "America/New_York",
    "engaged": 0,
    "conversion": 0,
    "goalId":3484187810,
    "visitorProfiles": [
            3484187710
        ]
}
 

 

Description

Creates `unpublished` Campaign with default request values, visitor profile id, goal id and returns campaignId, engagementId, and ac-revision

URI

/api/account/{accountId}/configuration/le-campaigns/campaigns

HTTP method

POST

Response codes

CREATED(201, "Created"),
BAD_REQUEST(400, "Bad Request"),
UNAUTHORIZED(401, "Unauthorized"),
FORBIDDEN(403, "Forbidden"),
NOT_FOUND(404, "Not Found"),
NOT_ACCEPTABLE(406, "Not Acceptable"),
CONFLICT(409, "Conflict"),
GONE(410, "Gone"),
PRECONDITION_FAILED(412, "Precondition Failed"),
UNSUPPORTED_MEDIA_TYPE(415, "Unsupported Media Type"),
INTERNAL_SERVER_ERROR(500, "Internal Server Error"),
SERVICE_UNAVAILABLE(503, "Service Unavailable");

Formats

JSON.

Path parameters

accountId

Query parameters

v
fields
field_set

Request headers

Authorization

Request body

 



{
    "name": "Proactive_Campaign_Creation_6", // From Input Name param
    "description": "Create and Publish Proactive Campaign v6", //Generated description from Name
    "type": 1, // CampaignType = Broadcast
    "startDate": "2019-07-16 00:00:00", //From input Start Date param
    "priority": 0.5,
    "weight": 0.2,
    "controlGroup": {
        "percentage": 0
    },
    "status": 0, // Status = Unpublished
    "engagements": [],
    "engagementIds": [],
    "timeZone": "America/New_York", // From input Time Zone param of the given customer
    "engaged": 0,
    "conversion": 0,
    "goalId":3484187810, // populated from #4 above
    "visitorProfiles": [
            3484187710 . // populated from #3 above
        ]
}
 

 

Description

Get campaign list for a specific accountId, the result can be filter using the input parameters

URI

/api/account/{accountId}/configuration/le-campaigns/campaigns

HTTP method

GET

Response codes

OK(200, "OK"),
BAD_REQUEST(400, "Bad Request"),
UNAUTHORIZED(401, "Unauthorized"),
FORBIDDEN(403, "Forbidden"),
NOT_FOUND(404, "Not Found"),
NOT_ACCEPTABLE(406, "Not Acceptable"),
CONFLICT(409, "Conflict"),
GONE(410, "Gone"),
PRECONDITION_FAILED(412, "Precondition Failed"),
UNSUPPORTED_MEDIA_TYPE(415, "Unsupported Media Type"),
INTERNAL_SERVER_ERROR(500, "Internal Server Error"),
SERVICE_UNAVAILABLE(503, "Service Unavailable");

Formats

JSON.

Path parameters

accountId

Query parameters

v
fields
field_set
select
filter
include_deleted

Request headers

Authorization

 

 

Description

Get engagement list for a specific accountId and campaignId, the result can be filter using the input parameters

URI

/api/account/{accountId}/configuration/le-campaigns/campaigns/{campaignId}/engagements

HTTP method

GET

Response codes

OK(200, "OK"),
BAD_REQUEST(400, "Bad Request"),
UNAUTHORIZED(401, "Unauthorized"),
FORBIDDEN(403, "Forbidden"),
NOT_FOUND(404, "Not Found"),
NOT_ACCEPTABLE(406, "Not Acceptable"),
CONFLICT(409, "Conflict"),
GONE(410, "Gone"),
PRECONDITION_FAILED(412, "Precondition Failed"),
UNSUPPORTED_MEDIA_TYPE(415, "Unsupported Media Type"),
INTERNAL_SERVER_ERROR(500, "Internal Server Error"),
SERVICE_UNAVAILABLE(503, "Service Unavailable");

Formats

JSON.

Path parameters

accountId

campaignId

Query parameters

v
fields
field_set
select
filter
include_deleted

Request headers

Authorization

 

Description

Delete campaign for aspecific accountId

URI

/api/account/{accountId}/configuration/le-campaigns/campaigns/{campaignId}

HTTP method

DELETE

Response codes

OK(200, "OK"),
BAD_REQUEST(400, "Bad Request"),
UNAUTHORIZED(401, "Unauthorized"),
FORBIDDEN(403, "Forbidden"),
NOT_FOUND(404, "Not Found"),
NOT_ACCEPTABLE(406, "Not Acceptable"),
CONFLICT(409, "Conflict"),
GONE(410, "Gone"),
PRECONDITION_FAILED(412, "Precondition Failed"),
UNSUPPORTED_MEDIA_TYPE(415, "Unsupported Media Type"),
INTERNAL_SERVER_ERROR(500, "Internal Server Error"),
SERVICE_UNAVAILABLE(503, "Service Unavailable");

Formats

JSON.

Path parameters

accountId

campaignId

Query parameters

v

Request headers

Authorization

If-Match (the latest revision_num should be written)

 

Description

Gets a specific engagement  for a specific account and campaign.

URI

/api/account/{accountId}/configuration/le-campaigns/campaigns/{campaignId}/engagements/{engagementId}

HTTP method

GET

Response codes

OK(200, "OK"),
BAD_REQUEST(400, "Bad Request"),
UNAUTHORIZED(401, "Unauthorized"),
FORBIDDEN(403, "Forbidden"),
NOT_FOUND(404, "Not Found"),
NOT_ACCEPTABLE(406, "Not Acceptable"),
CONFLICT(409, "Conflict"),
GONE(410, "Gone"),
PRECONDITION_FAILED(412, "Precondition Failed"),
UNSUPPORTED_MEDIA_TYPE(415, "Unsupported Media Type"),
INTERNAL_SERVER_ERROR(500, "Internal Server Error"),
SERVICE_UNAVAILABLE(503, "Service Unavailable");

Formats

JSON.

Path parameters

accountId

campaignId

engagementId

Query parameters

v

fields

field_set

include_deleted

Request headers

Authorization

 

 

Description

Update an Engagement for a specific account and campaign.

URI

/api/account/{accountId}/configuration/le-campaigns/campaigns/{campaignId}/engagements/{engagementId}

HTTP method

PUT

Response codes

OK(200, "OK"),
BAD_REQUEST(400, "Bad Request"),
UNAUTHORIZED(401, "Unauthorized"),
FORBIDDEN(403, "Forbidden"),
NOT_FOUND(404, "Not Found"),
NOT_ACCEPTABLE(406, "Not Acceptable"),
CONFLICT(409, "Conflict"),
GONE(410, "Gone"),
PRECONDITION_FAILED(412, "Precondition Failed"),
UNSUPPORTED_MEDIA_TYPE(415, "Unsupported Media Type"),
INTERNAL_SERVER_ERROR(500, "Internal Server Error"),
SERVICE_UNAVAILABLE(503, "Service Unavailable");

Formats

JSON.

Path parameters

accountId

campaignId

Query parameters

v
fields
field_set

Request headers

Authorization

If-Match (the latest revision_num should be written)

Request body

 



{
    "deleted": false,
    "id": 3571998410,
    "name": "Engagement 1",
    "description": "Engagement 1 Description",
    "modifiedDate": "2019-07-31 12:46:15",
    "createdDate": "2019-07-31 12:46:15",
    "channel": 1,
    "type": 13, //App Install
    "onsiteLocations": [
        3484188010
    ],
    "visitorBehaviors": [
        3484187910
    ],
    "enabled": true,
    "language": "en-US",
    "displayInstances": [
        {
            "displayInstanceType": 5,
            "enabled": true
        }
    ],
    "timeInQueue": 0,
    "isPopOut": false,
    "isUnifiedWindow": false,
    "appInstallationId": "2d78cdc8-b1d7-4da2-a38d-74dd6d564d38",
    "useSystemRouting": false,
    "allowUnauthMsg": true,
    "zones": [],
    "subType": 34, //App Install
    "source": 12, //App Install
    "connectorId": 3484210010,
    "availabilityPolicy": 0,
    "renderingType": 0,
    "conversationType": 1
}
 

 

Description

Delete campaign for aspecific accountId

URI

/api/account/{accountId}/configuration/le-campaigns/campaigns/{campaignId}/engagements/{engagementId}

HTTP method

DELETE

Response codes

OK(200, "OK"),
BAD_REQUEST(400, "Bad Request"),
UNAUTHORIZED(401, "Unauthorized"),
FORBIDDEN(403, "Forbidden"),
NOT_FOUND(404, "Not Found"),
NOT_ACCEPTABLE(406, "Not Acceptable"),
CONFLICT(409, "Conflict"),
GONE(410, "Gone"),
PRECONDITION_FAILED(412, "Precondition Failed"),
UNSUPPORTED_MEDIA_TYPE(415, "Unsupported Media Type"),
INTERNAL_SERVER_ERROR(500, "Internal Server Error"),
SERVICE_UNAVAILABLE(503, "Service Unavailable");

Formats

JSON.

Path parameters

accountId

campaignId

engagementId

Query parameters

v

Request headers

Authorization

If-Match (the latest revision_num should be written)