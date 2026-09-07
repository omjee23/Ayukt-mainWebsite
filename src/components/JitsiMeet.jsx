import React, { useEffect } from 'react';
import API from '../config/api';

const JitsiMeet = ({ roomName, studentId, classId, userName }) => {
  useEffect(() => {
    // 1. Mark Attendance automatically on join
    const markAttendance = async () => {
      try {
        await API.post('/attendance/mark', {
          studentId,
          classId
        });
      } catch (err) {
        console.error('Attendance Error:', err);
      }
    };

    if (studentId && classId) {
      markAttendance();
    }

    // 2. Load Jitsi Meet Iframe Script
    const domain = 'meet.jit.si';
    const options = {
      roomName: roomName || 'NGO_Jigyaasa_Classroom',
      width: '100%',
      height: 500,
      parentNode: document.querySelector('#jitsi-container'),
      userInfo: {
        displayName: userName || 'Student'
      }
    };

    const script = document.createElement('script');
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => {
      if (window.JitsiMeetExternalAPI) {
        new window.JitsiMeetExternalAPI(domain, options);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [roomName, studentId, classId, userName]);

  return (
    <div style={{ marginTop: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
      <div id="jitsi-container"></div>
    </div>
  );
};

export default JitsiMeet;