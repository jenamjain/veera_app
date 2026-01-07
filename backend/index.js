require('dotenv').config();
const express = require('express');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);
const app = express();
app.use(express.json());

// Allow cross-origin requests from your React Native app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.post('/api/send-sos', async (req, res) => {
  console.log('SOS request received:', req.body);
  const { emergencyContacts, name, location, currentTime } = req.body;
  
  try {
    const messageBody = `🚨 SOS ALERT\n${name} needs help.\nLocation: ${location}\nTime: ${currentTime}`;
    console.log('Message body:', messageBody);
    
    // Send SMS to all emergency contacts
    const promises = emergencyContacts.map(contact => {
      const phoneNumber = contact.number.startsWith('+') ? contact.number : `+91${contact.number}`;
      console.log('Sending to:', phoneNumber);
      
      return client.messages.create({
        body: messageBody,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });
    });

    const results = await Promise.all(promises);
    console.log('Messages sent:', results);
    
    res.send(JSON.stringify({ 
      success: true, 
      messagesSent: results.length,
      messageIds: results.map(r => r.sid)
    }));
    
  } catch (err) {
    console.error('Error sending SOS messages:', err);
    res.status(500).send(JSON.stringify({ 
      success: false, 
      error: err.message 
    }));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});