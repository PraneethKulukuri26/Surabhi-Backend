const fs = require("fs");
const path = require("path");
const database=require("../Config/database");

const eventFilePath = path.join(__dirname, "/public/Events/eventData.json");

function loadExistingIds() {
    try {
        if (fs.existsSync(eventFilePath)) {
            const data = fs.readFileSync(eventFilePath, "utf8");
            const events = JSON.parse(data);
            return events.map(event => event.EID); 
        }
    } catch (error) {
        console.error("Error reading event data:", error);
        throw new Error("Error reading event data");
    }
}

function generateUniqueId() {
    try {
        const existingIds = new Set(loadExistingIds());
        let id;
        do {
            id = Math.floor(1000 + Math.random() * 9000); 
        } while (existingIds.has(id));
        return id;
    } catch (err) {
        throw err;
    }
}

function getEventFilePath(event) {
    switch (event) {
        case "Music":
            return path.join(__dirname, "/public/Events/music.json");
        case "Sports":
            return path.join(__dirname, "/public/Events/sports.json");
        case "Technology":
            return path.join(__dirname, "/public/Events/technology.json");
        default:
            throw new Error("Invalid event type");
    }
}

function updateEventDataJson(EID, filePath) {
    let eventData = [];
    
    if (fs.existsSync(eventFilePath)) {
        eventData = JSON.parse(fs.readFileSync(eventFilePath, "utf8"));
    }

    eventData.push({ EID, filePath });

    fs.writeFileSync(eventFilePath, JSON.stringify(eventData, null, 4));
}

function deleteEventDataJson(EID){
    let eventData = [];
    
    if (fs.existsSync(eventFilePath)) {
        eventData = JSON.parse(fs.readFileSync(eventFilePath, "utf8"));
    }

    const updatedEventData = eventData.filter(event => event.EID !== EID);

    if (updatedEventData.length === eventData.length) {
        console.log("No event found with EID:", EID);
        return;
    }

    fs.writeFileSync(eventFilePath, JSON.stringify(updatedEventData, null, 4));
}

function getEventPath(EID) {
    try {
        if (!EID) throw new Error("EID is required");

        let eventData = [];

        if (fs.existsSync(eventFilePath)) {
            const data = fs.readFileSync(eventFilePath, "utf8");
            eventData = JSON.parse(data);
        }

        const event = eventData.find(event => event.EID === EID);

        if (!event) {
            throw new Error(`No event found with EID: ${EID}`);
        }

        return event.path;
    } catch (error) {
        console.error("Error fetching event path:", error);
        return null;
    }
}

async function addEvent(params, image) {
    const {
        Description, Venue, Prizes, Rules, ParticipationRatio, 
        RegistrationRequirement, Contact, StartTime, EndTime, Day,event
    } = params;    

    try {
        if(!event) throw new Error("Event is requered.");

        let EventFilePath=getEventFilePath(event);

        if (!Description || !Venue) throw new Error("Incomplete information");

        if (!Prizes || !Array.isArray(Prizes) || Prizes.length === 0) 
            throw new Error("Prizes must be a non-empty array");

        if (!Rules || !Array.isArray(Rules) || Rules.length === 0) 
            throw new Error("Rules must be a non-empty array");

        if (!ParticipationRatio || typeof ParticipationRatio !== "number" || ParticipationRatio <= 0) 
            throw new Error("Participation Ratio must be a positive number");

        if (!RegistrationRequirement || typeof RegistrationRequirement !== "string") 
            throw new Error("Registration Requirement must be a string");

        if (!Contact || typeof Contact !== "string") 
            throw new Error("Contact must be a valid string");

        if (!StartTime || isNaN(Date.parse(StartTime))) 
            throw new Error("Invalid Start Time");

        if (!EndTime || isNaN(Date.parse(EndTime))) 
            throw new Error("Invalid End Time");

        if (new Date(StartTime) >= new Date(EndTime)) 
            throw new Error("Start Time must be before End Time");

        if (!image) 
            throw new Error("Event image is required");

        let EID = generateUniqueId();

        await image.mv(`public/images/event/${EID}`);

        const newEvent = {
            EID,
            Description,
            Venue,
            Prizes,
            Rules,
            ParticipationRatio,
            RegistrationRequirement,
            Contact,
            StartTime,
            EndTime,
            Day,
            imagePath: `/public/images/event/${EID}`
        };

        let musicData = {};
        if (fs.existsSync(EventFilePath)) {
            const data = fs.readFileSync(EventFilePath, "utf8");
            musicData = JSON.parse(data);
        } else {
            throw new Error("Event not found.");
        }

        musicData.events.push(newEvent);

        fs.writeFileSync(EventFilePath, JSON.stringify(musicData, null, 4));

        updateEventDataJson(EID,EventFilePath);

    } catch (err) {
        throw err;
    }
}

async function deleteEvent(event, EID) {
    try {
        if (!event) throw new Error("Event type is required.");
        if (!EID) throw new Error("EID is required.");

        const EventFilePath = getEventFilePath(event);

        if (!fs.existsSync(EventFilePath)) {
            throw new Error("Event file not found.");
        }

        let eventData = JSON.parse(fs.readFileSync(EventFilePath, "utf8"));

        if (!eventData.events || eventData.events.length === 0) {
            throw new Error("No events found.");
        }

        const eventIndex = eventData.events.findIndex(evt => evt.EID === EID);
        if (eventIndex === -1) {
            throw new Error("Event not found.");
        }

        const eventToDelete = eventData.events[eventIndex];
        if (eventToDelete.imagePath) {
            const imagePath = path.join(__dirname, eventToDelete.imagePath);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        eventData.events.splice(eventIndex, 1);

        fs.writeFileSync(EventFilePath, JSON.stringify(eventData, null, 4));

        deleteEventDataJson(EID);

        return { message: "Event successfully deleted!", EID };
    } catch (err) {
        throw err;
    }
}

async function updateEvent(event, EID, updates, newImage) {
    try {
        if (!event) throw new Error("Event type is required.");
        if (!EID) throw new Error("EID is required.");
        
        const EventFilePath = getEventFilePath(event);

        if (!fs.existsSync(EventFilePath)) {
            throw new Error("Event file not found.");
        }

        let eventData = JSON.parse(fs.readFileSync(EventFilePath, "utf8"));

        if (!eventData.events || eventData.events.length === 0) {
            throw new Error("No events found.");
        }

        const eventIndex = eventData.events.findIndex(evt => evt.EID === EID);
        if (eventIndex === -1) {
            throw new Error("Event not found.");
        }

        const eventToUpdate = eventData.events[eventIndex];

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                eventToUpdate[key] = updates[key];
            }
        });

        if (newImage) {
            const oldImagePath = path.join(__dirname, eventToUpdate.imagePath);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

            const newImagePath = `public/images/event/${EID}`;
            await newImage.mv(newImagePath);
            eventToUpdate.imagePath = `/${newImagePath}`;
        }

        eventData.events[eventIndex] = eventToUpdate;

        fs.writeFileSync(EventFilePath, JSON.stringify(eventData, null, 4));

        return { message: "Event successfully updated!", updatedEvent: eventToUpdate };
    } catch (err) {
        throw err;
    }
}

async function getEvent(EID) {
    try{
        if(!EID) throw new Error("Event is required.");

        const eventPath=getEventPath(EID);

        if (!fs.existsSync(eventPath)) {
            throw new Error("Event file not found.");
        }

        let eventData = JSON.parse(fs.readFileSync(eventPath, "utf8"));

        if (!eventData.events || eventData.events.length === 0) {
            throw new Error("No events found.");
        }

        const event = eventData.events.find(evt => evt.EID === EID);
        
        if (!event) throw new Error(`Event with EID ${EID} not found.`);

        return event;

    }catch(err){
        throw err;
    }
}

async function registerEvent(UID,EID) {
    try{
        let path=getEventPath(EID);

        const EventFilePath = getEventPath(path);

        if (!fs.existsSync(EventFilePath)) {
            throw new Error("Event file not found.");
        }

        let eventData = JSON.parse(fs.readFileSync(EventFilePath, "utf8"));

        if (!eventData.events || eventData.events.length === 0) {
            throw new Error("No events found.");
        }

        const event = eventData.events.find(evt => evt.EID === EID);
        
        if (!event) throw new Error(`Event with EID ${EID} not found.`);

        const {StartTime,EndTime,Day}=event;

        try{
            const db=await database.getConnection();

            await db.beginTransaction();

            const [existingRegistrations] = await db.query(`SELECT * FROM registerSurabhi WHERE UID = ? AND ((startTime BETWEEN ? AND ?) OR (endStart BETWEEN ? AND ?)) AND dayEvent = ?`,[UID,StartTime,EndTime,StartTime,EndTime,Day]);

            if (existingRegistrations.length > 0) {
                throw new Error("User is already registered for an event in this time slot.");
            }

            await db.query('insert into registerSurabhi (EID,startTime,endStart,dayEvent,UID) values(?,?,?,?,?)',[EID,StartTime,EndTime,Day,UID]);

            await db.commit();
        }catch(err){
            await conn.rollback();
            throw err;
        }

    }catch(err){
        throw err;
    }
}

async function unRegisterEvent(UID,EID) {
    try{
        
        const conn=await database.getConnection();

        await conn.beginTransaction();

        const [existingRegistration] = await conn.query(`SELECT * FROM registerSurabhi WHERE UID = ? AND EID = ?`,[UID, EID]);

        if (existingRegistration.length === 0) {
            throw new Error("User is not registered for this event.");
        }

        await conn.query(`DELETE FROM registerSurabhi WHERE UID = ? AND EID = ?`,[UID, EID]);
        await conn.commit();
        
    }catch(err){
        await conn.rollback();
        throw err;
    }finally{
        conn.release();
    }
}

module.exports={
    addEvent,
    deleteEvent,
    updateEvent,
    getEvent,
    registerEvent,
    unRegisterEvent,
}
