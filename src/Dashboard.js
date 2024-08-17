import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import './App.css';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Card = styled.div`
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 85%;
  margin: 50px auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 25px;
`;

const TableHead = styled.thead`
  font-weight: bold;
  text-align: center;
  background-color: #4a90e2;
  color: #ffffff;
  border-radius: 10px;
`;

const TableBody = styled.tbody`
  font-size: 16px;
  text-align: center;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #e8f1f7;
  }
  &:hover {
    background-color: #d0e7ff;
  }
`;

const TableCell = styled.td`
  padding: 15px;
  border-bottom: 1px solid #d0e7ff;
`;

const EditableCell = styled(TableCell)`
  cursor: pointer;
  &:hover {
    background-color: #f0faff;
  }
`;

const Input = styled.input`
  width: 80%;
  padding: 10px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 15px;
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background-color: #34c759;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #28a745;
  }
`;

const Error = styled.div`
  color: #ff4d4f;
  font-weight: bold;
  font-size: 18px;
`;

const Dashboard = () => {
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newLecture, setNewLecture] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://vedantk3.pythonanywhere.com/api/schedule');
      setSchedule(response.data.schedule);
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      if (response.data.schedule.hasOwnProperty(today)) {
        setTodaySchedule(response.data.schedule[today]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data. Please try again later.');
    }
  };

  const handleSave = async (id, day, field) => {
    try {
      let endpoint = 'update';
      let data = { day, id };
  
      if (field === 'lecture') {
        data.lecture = newLecture;
        console.log('Updating lecture:', data); // Debug log
      } else if (field === 'time') {
        endpoint = 'update-timeslot';
        data.start_time = newStartTime;
        data.end_time = newEndTime;
        console.log('Updating time slot:', data); // Debug log
      }
  
      const response = await axios.put(`https://vedantk3.pythonanywhere.com/api/${endpoint}`, data);
      console.log('Update successful:', response.data);
  
      // Refresh the data after the update
      fetchData();
  
      // Clear the editing fields
      setEditingField(null);
      setNewStartTime('');
      setNewEndTime('');
      setNewLecture('');
    } catch (error) {
      console.error('Error updating:', error);
      setError('Error updating. Please try again.');
    }
  };
  

  if (error) {
    return <Error>{error}</Error>;
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <Card>
      <Container>
        <h1>Smart Bell Dashboard 🎛️</h1>
      </Container>
      <Container>
        <h2>
          Today's Date 📅:{' '}
          <span>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </h2>
      </Container>
      {todaySchedule.length === 0 ? (
        <Container>
          <p>No schedule available for today.</p>
        </Container>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Start Time</TableCell>
              <TableCell>Lecture</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {todaySchedule.map((item) => (
              <TableRow key={item.id}>
                <EditableCell>
                  {editingField === `time-${item.id}` ? (
                    <>
                      <Input
                        type="time"
                        value={newStartTime || item.start_time}
                        onChange={(e) => setNewStartTime(e.target.value)}
                      />
                      <Input
                        type="time"
                        value={newEndTime || item.end_time}
                        onChange={(e) => setNewEndTime(e.target.value)}
                      />
                      <SaveButton onClick={() => handleSave(item.id, today, 'time')}>
                        Save
                      </SaveButton>
                    </>
                  ) : (
                    <>
                      <div onClick={() => setEditingField(`time-${item.id}`)}>
                        {item.start_time} - {item.end_time}
                      </div>
                    </>
                  )}
                </EditableCell>
                <EditableCell>
                  {editingField === `lecture-${item.id}` ? (
                    <>
                      <Input
                        type="text"
                        value={newLecture || item.lecture}
                        onChange={(e) => setNewLecture(e.target.value)}
                      />
                      <SaveButton onClick={() => handleSave(item.id, today, 'lecture')}>
                        Save
                      </SaveButton>
                    </>
                  ) : (
                    <div onClick={() => setEditingField(`lecture-${item.id}`)}>
                      {item.lecture}
                    </div>
                  )}
                </EditableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
};

export default Dashboard;
