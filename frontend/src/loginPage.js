import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {
    // const [authUrl, setAuthUrl] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
      });

    // const createAccount = async () => {
    //     const response = await axios.post('http://localhost:8000/create_account/', {});
    //     setAuthUrl(response.data.auth_url);
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value,
        });
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await axios.post('http://localhost:8000/create_account/', formData);
          sessionStorage.setItem('userId', response.data.userId);
          window.location.href = response.data.auth_url;
        } catch (error) {
          console.error('Error creating account:', error);
        }
      };

    return (
        <div>
            <h1>Create Account</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <button type="submit">Create Account and Login with Outlook</button>
            </form>

            {/* <button onClick={createAccount}>Link Outlook Account</button>
            {authUrl && <a href={authUrl}>Login with Outlook</a>} */}
        </div>
    );
}

export default LoginPage;