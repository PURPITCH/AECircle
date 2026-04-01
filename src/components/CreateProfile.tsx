import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../types';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  designation: z.string().min(1, 'Designation is required'),
  picture: z.string().url('Must be a valid URL'),
  dateOfBirth: z.string(),
  nationality: z.string().min(1, 'Nationality is required'),
  residentStatus: z.string(),
  sex: z.enum(['Male', 'Female', 'Other']),
  height: z.number().min(100).max(300),
  weight: z.number().min(30).max(200),
  medicalConditions: z.array(z.string()),
  basicTraining: z.array(z.string()),
  licenses: z.array(z.object({
    type: z.string(),
    issuingAuthority: z.string(),
  })),
  certifyingExperience: z.array(z.object({
    type: z.enum(['line', 'base', 'workshop', 'techPub', 'planning', 'quality', 'safety']),
    description: z.string(),
    duration: z.string(),
  })),
  nonCertifyingExperience: z.array(z.object({
    type: z.enum(['line', 'base', 'workshop', 'techPub', 'planning', 'quality', 'safety']),
    description: z.string(),
    duration: z.string(),
  })),
  driversLicense: z.object({
    number: z.string(),
    issuingCountry: z.string(),
    vehicleType: z.string().optional(),
  }),
  continuousTraining: z.array(z.string()),
  companyTraining: z.array(z.string()),
  hasToolBox: z.boolean(),
  otherTraining: z.array(z.string()),
});

export const CreateProfile: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      medicalConditions: [],
      basicTraining: [''],
      licenses: [{ type: '', issuingAuthority: '' }],
      certifyingExperience: [{ type: 'line', description: '', duration: '' }],
      nonCertifyingExperience: [{ type: 'line', description: '', duration: '' }],
      continuousTraining: [''],
      companyTraining: [],
      otherTraining: [],
      hasToolBox: false,
    },
  });

  const onSubmit = (data: Profile) => {
    console.log(data);
    // Here you would typically save the data to your backend
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-700">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-8">Create Profile</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-blue-400">Personal Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Designation</label>
                <input
                  type="text"
                  {...register('designation')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
                {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Profile Picture URL</label>
                <input
                  type="url"
                  {...register('picture')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
                {errors.picture && <p className="text-red-500 text-sm mt-1">{errors.picture.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Date of Birth</label>
                <input
                  type="date"
                  {...register('dateOfBirth')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Sex</label>
                <select
                  {...register('sex')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-blue-400">Additional Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300">Nationality</label>
                <input
                  type="text"
                  {...register('nationality')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Resident Status</label>
                <input
                  type="text"
                  {...register('residentStatus')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Height (cm)</label>
                <input
                  type="number"
                  {...register('height', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Weight (kg)</label>
                <input
                  type="number"
                  {...register('weight', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium"
            >
              Create Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};