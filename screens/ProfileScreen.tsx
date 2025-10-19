'use client';

import React, { useState, useEffect } from 'react';
import { StorageService } from '@/services/StorageService';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
}

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    reminderTime: string;
  };
  privacy: {
    profilePublic: boolean;
    showStats: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const [userProfile, userSettings] = await Promise.all([
        StorageService.getUserProfile(),
        StorageService.getUserSettings()
      ]);
      setProfile(userProfile);
      setSettings(userSettings);
      setEditForm({ name: userProfile.name, email: userProfile.email });
    } catch (error) {
      console.error('Failed to load user data:', error);
      setSaveMessage('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    try {
      setIsSaving(true);
      setSaveMessage('');
      
      const updatedProfile = { ...profile, ...editForm };
      await StorageService.updateUserProfile(updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSaveMessage('Profile updated successfully');
      
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveMessage('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = async (
    category: keyof UserSettings,
    key: string,
    value: any
  ) => {
    if (!settings) return;
    
    try {
      const updatedSettings = {
        ...settings,
        [category]: {
          ...settings[category],
          [key]: value
        }
      };
      
      await StorageService.updateUserSettings(updatedSettings);
      setSettings(updatedSettings);
      setSaveMessage('Settings updated');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      console.error('Failed to update settings:', error);
      setSaveMessage('Failed to update settings');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      await StorageService.deleteUserAccount();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Failed to delete account:', error);
      setSaveMessage('Failed to delete account');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          </div>

          {saveMessage && (
            <div className={`mx-6 mt-4 p-3 rounded-md ${
              saveMessage.includes('Failed') 
                ? 'bg-red-50 text-red-700' 
                : 'bg-green-50 text-green-700'
            }`}>
              {saveMessage}
            </div>
          )}

          <div className="p-6 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({ name: profile.name, email: profile.email });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="text-2xl text-gray-600">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="text-xl font-semibold text-gray-900 border-b-2 border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                    )}
                    <p className="text-sm text-gray-500">Member since {new Date(profile.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (