import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

const API_BASE_URL = "https://rsfire-crm-erp-backend-v1-0.vercel.app";

export default function AddProject() {
  const [newProject, setNewProject] = useState({
    name: '',
    requirement: '',
    projectValue: '',
    documents: [],
    assignTeam: '',
    sector: '',
    date: new Date().toISOString().split('T')[0],
    status: 'active'  // Set the default status to 'active'
  });
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target
    setNewProject(prev => ({ ...prev, [name]: value }))
  }

  const handleProjectSelectChange = (e) => {
    const { name, value } = e.target
    setNewProject(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }));
  }

  const validateProjectForm = () => {
    const newErrors = {};
    if (!newProject.name.trim()) newErrors.name = "Name is required";
    if (!newProject.requirement) newErrors.requirement = "Requirement is required";
    if (!newProject.projectValue.trim()) newErrors.projectValue = "Project value is required";
    if (!newProject.assignTeam) newErrors.assignTeam = "Team assignment is required";
    if (!newProject.location) newErrors.location = "Location is required";
    if (!newProject.contact) newErrors.contact = "Contact is required";
    if (!newProject.sector) newErrors.sector = "Sector is required";
    if (!newProject.date) newErrors.date = "Date is required";
    if (newProject.documents.length === 0) newErrors.documents = "At least one document is required";
    
    console.log('Validation errors:', newErrors);
    return newErrors;
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    console.log('Current project state:', newProject);
    const newErrors = validateProjectForm();
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Form is valid:', isValid);
    
    setErrors(newErrors);
    
    console.log('Current errors:', newErrors);
    if (!isValid) {
      console.log('Form validation failed. Errors:', newErrors);
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (window.confirm("Are you sure you want to submit this project? This action cannot be undone.")) {
      submitProject();
    }
  };

  const submitProject = async () => {
    try {
      const formData = new FormData();
      
      // Append all non-file data
      Object.entries(newProject).forEach(([key, value]) => {
        if (key !== 'documents') {
          formData.append(key, value);
        }
      });

      // Append files and their labels
      newProject.documents.forEach((doc, index) => {
        if (doc.file instanceof File) {
          formData.append('documents', doc.file);
          formData.append('documentLabels', doc.label);
        }
      });

      const response = await axios.post(`${API_BASE_URL}/projects`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      console.log('Server response:', response.data);
      toast.success("Project added successfully");
      
      // Reset form
      setNewProject({
        name: '',
        requirement: '',
        projectValue: '',
        documents: [],
        assignTeam: '',
        location: '',
        sector: '',
        contact: '',
        date: new Date().toISOString().split('T')[0],
        status: 'active'
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error(error.response?.data?.message || "Failed to add project");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    console.log('Files selected:', files);
    const newDocuments = files.map(file => ({
      file: file,  // Store the actual file object
      label: file.name
    }));
    setNewProject(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
  };

  const handleRemoveDocument = (index) => {
    setNewProject(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  }

  const handleDocumentLabelChange = (index, newLabel) => {
    setNewProject(prev => ({
      ...prev,
      documents: prev.documents.map((doc, i) => 
        i === index ? { ...doc, label: newLabel } : doc
      )
    }));
  }

  return (
    <form onSubmit={handleProjectSubmit}>
      <div className="grid grid-cols-9 gap-4 mb-4 gap-4 mb-4" style={{overflowX:'scroll'}}>
        <div className="flex flex-col">
          <Label htmlFor="name" className="mb-1">Name*</Label>
          <Input 
            id="name" 
            name="name"
            value={newProject.name}
            onChange={handleProjectInputChange}
            placeholder="Client Name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
        </div>
        <div className="flex flex-col">
          <Label htmlFor="requirement" className="mb-1">Requirement*</Label>
          <select 
            id="requirement"
            name="requirement"
            value={newProject.requirement}
            onChange={handleProjectSelectChange}
            className={`w-full p-2 border rounded ${errors.requirement ? "border-red-500" : ""}`}
          >
            <option value="">Select requirement</option>
            <option value="AMC">AMC</option>
            <option value="NOC">NOC</option>
            <option value="Fire Hydrant Installation">Fire Hydrant Installation</option>
          </select>
          {errors.requirement && <span className="text-red-500 text-sm">{errors.requirement}</span>}
        </div>
        <div className="flex flex-col">
          <Label htmlFor="projectValue" className="mb-1">Project value*</Label>
          <Input 
            id="projectValue" 
            name="projectValue"
            value={newProject.projectValue}
            onChange={handleProjectInputChange}
            placeholder="Project value"
            className={errors.projectValue ? "border-red-500" : ""}
          />
          {errors.projectValue && <span className="text-red-500 text-sm">{errors.projectValue}</span>}
        </div>
        <div className="flex flex-col">
          <Label htmlFor="documents" className="mb-1">Documents*</Label>
          <Input 
            id="documents" 
            name="documents"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          {errors.documents && <span className="text-red-500 text-sm">{errors.documents}</span>}
        </div>
        <div className="flex flex-col">
          <Label htmlFor="assignTeam" className="mb-1">Assign Team*</Label>
          <select 
            id="assignTeam"
            name="assignTeam"
            value={newProject.assignTeam}
            onChange={handleProjectSelectChange}
            className={`w-full p-2 border rounded ${errors.assignTeam ? "border-red-500" : ""}`}
          >
            <option value="">Select team</option>
            <option value="1001">1001</option>
            <option value="1002">1002</option>
            <option value="1003">1003</option>
            <option value="1004">1004</option>
            <option value="1005">1005</option>
          </select>
          {errors.assignTeam && <span className="text-red-500 text-sm">{errors.assignTeam}</span>}
        </div>
        <div className="flex flex-col">
          <Label htmlFor="sector" className="mb-1">Sector/Industry*</Label>
          <select 
            id="sector"
            name="sector"
            value={newProject.sector}
            onChange={handleProjectSelectChange}
            className={`w-full p-2 border rounded ${errors.sector ? "border-red-500" : ""}`}
          >
            <option value="">Select sector</option>
            <option value="IT">IT Company</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Individual">Individual</option>
            <option value="High rise">High rise</option>
            <option value="Others">Others</option>
          </select>
          {errors.sector && <span className="text-red-500 text-sm">{errors.sector}</span>}
        </div>
        <div className="flex flex-col">
          <Label htmlFor="contact" className="mb-1">Contact*</Label>
         <Input
         id="contact"
         name="contact"
         type="text"
         value={newProject.contact}
         onChange={handleProjectInputChange}
         className={errors.contact ? "border-red-500" : ""}
         />
          {errors.contact && <span className="text-red-500 text-sm">{errors.contact}</span>}
          
        </div>
        <div className="flex flex-col">
          <Label htmlFor="projectDate" className="mb-1">Date*</Label>
          <Input 
            id="projectDate" 
            name="date"
            type="date"
            value={newProject.date}
            onChange={handleProjectInputChange}
            className={errors.date ? "border-red-500" : ""}
          />
          {errors.date && <span className="text-red-500 text-sm">{errors.date}</span>}
        </div>
        <div className="flex flex-col">
          <Label htmlFor="location" className="mb-1">Location*</Label>
          <Input 
            id="location" 
            name="location"
            type="text"
            value={newProject.location || ''}
            onChange={handleProjectInputChange}
            className={errors.location ? "border-red-500" : ""}
          />
          {errors.location && <span className="text-red-500 text-sm">{errors.location}</span>}
        </div>
      </div>
      {newProject.documents.length > 0 && (
        <div className="mb-4">
          <Label className="mb-2">Uploaded Documents:</Label>
          {newProject.documents.map((doc, index) => (
            <div key={index} className="flex items-center mb-2">
              <Input
                value={doc.label}
                onChange={(e) => handleDocumentLabelChange(index, e.target.value)}
                className="mr-2"
              />
              <Button 
                type="button" 
                onClick={() => handleRemoveDocument(index)}
                variant="destructive"
                size="sm"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
      <Button type="submit" className="submitButtons" >Add Project<span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
</svg>
</span></Button>
      </div>
    </form>
  );
}