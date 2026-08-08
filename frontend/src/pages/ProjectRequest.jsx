import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AlertCircle, CloudLightning, ArrowLeft } from 'lucide-react';

export default function ProjectRequest() {
  const { user, addToast, checkAuth } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectType, setProjectType] = useState('Website Development');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  
  const [couponFeedback, setCouponFeedback] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill parameters if arriving from pricing pages
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
    }

    const typeParam = searchParams.get('type');
    const budgetParam = searchParams.get('budget');
    const couponParam = searchParams.get('coupon');

    if (typeParam) setProjectType(typeParam);
    if (budgetParam) setBudget(budgetParam);
    if (couponParam) {
      setCouponCode(couponParam);
      validateCoupon(couponParam);
    }
  }, [user, searchParams]);

  const validateCoupon = (code) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (cleanCode === 'WELCOME20' || cleanCode === 'FREELANCE20') {
      setCouponFeedback(true);
      return true;
    }
    setCouponFeedback(false);
    return false;
  };

  const handleVerifyCoupon = () => {
    if (validateCoupon(couponCode)) {
      addToast("20% Discount Coupon verified!");
    } else {
      addToast("Invalid coupon code.");
    }
  };

  const handleStepNavigation = (direction) => {
    setError(null);
    if (direction === 1) {
      if (currentStep === 1) {
        if (!name.trim() || !email.trim()) {
          setError("Name and Email address are required fields.");
          return;
        }
      } else if (currentStep === 2) {
        if (!deadline || !description.trim()) {
          setError("Deadline and Project specifications are required.");
          return;
        }
      }
    }
    setCurrentStep((prev) => prev + direction);
  };

  const simulateFileUpload = () => {
    const fileNames = ["Specs_Layout_Final.pdf", "SaaS_Flowchart.zip", "ProjectBrief.docx"];
    const rand = fileNames[Math.floor(Math.random() * fileNames.length)];
    setSelectedFileName(rand);
    addToast(`Attached spec sheet: ${rand}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      email,
      phone,
      projectType,
      deadline,
      description,
      budget,
      couponCode,
      attachmentName: selectedFileName || 'Project Specification.pdf'
    };

    try {
      const data = await api.submitProjectRequest(payload);
      if (data && data.success) {
        addToast(data.message);
        // Force authentication check in context since backend auto-logged client in
        await checkAuth();
        setTimeout(() => {
          navigate('/client/dashboard');
        }, 1500);
      } else {
        setError(data.message || "Failed to submit project request.");
      }
    } catch (err) {
      console.error(err);
      setError("Connection to backend lost.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-24 px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl p-8 relative z-10 space-y-8">
        
        {/* Header progress info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-text-light">
            <span>Step {currentStep} of 3</span>
            <span>{currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%'} Completed</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
              style={{ width: `${currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100}%` }}
            ></div>
          </div>
          <h2 className="text-3xl font-poppins font-extrabold text-text-dark">
            {currentStep === 1 ? 'Contact Details' : currentStep === 2 ? 'Project Roadmap' : 'Budget & Uploads'}
          </h2>
          <p className="text-xs text-text-light">
            {currentStep === 1 ? 'Provide contact information to coordinate proposal specifications.' :
             currentStep === 2 ? 'Select category templates and timeline roadmaps.' :
             'Establish project pricing structures and upload wireframe files.'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-text-dark">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="john@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs font-medium"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 234 567 890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label>Service Category *</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs"
                  >
                    <option value="Website Development">Website Development</option>
                    <option value="Spring Boot Backend">Spring Boot Backend</option>
                    <option value="MongoDB Design">MongoDB Design</option>
                    <option value="AI Integrations">AI Integrations</option>
                    <option value="Android Apps">Android Apps</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label>Desired Deadline *</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs text-text-light font-medium"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <label>Project Description *</label>
                <textarea
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline page requirements, backend integrations, or database models..."
                  className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs resize-none font-medium"
                />
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="flex items-center justify-between">
                    <span>Target Budget (USD) *</span>
                    {budget && (
                      <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ≈ ₹{Math.round((parseFloat(budget) || 0) * 83).toLocaleString('en-IN')} INR
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                    <input
                      type="number"
                      placeholder="1500"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      required
                      className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 outline-none focus:border-primary/50 text-xs font-medium w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label>Promo Discount Coupon</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="WELCOME20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs font-medium w-full"
                    />
                    <button type="button" onClick={handleVerifyCoupon} className="bg-slate-100 hover:bg-slate-200 px-4 rounded-xl text-xs font-semibold">Verify</button>
                  </div>
                  {couponFeedback && <span className="text-[10px] text-emerald-500 font-bold">Coupon WELCOME20 applied! (20% discount)</span>}
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label>Upload Scope Attachment</label>
                <div 
                  onClick={simulateFileUpload}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-primary/50 cursor-pointer transition-colors"
                >
                  <CloudLightning className={`w-8 h-8 mx-auto mb-2 ${selectedFileName ? 'text-emerald-500 animate-bounce' : 'text-text-light'}`} />
                  <span className="block text-text-dark font-semibold text-xs">
                    {selectedFileName ? `Selected: ${selectedFileName}` : 'Click to select project specification documents (PDF, ZIP)'}
                  </span>
                  <span className="text-[10px] text-text-light font-normal">Max size: 10MB. Mock simulator.</span>
                </div>
              </div>
            </div>
          )}

          {/* Nav Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => handleStepNavigation(-1)}
                className="border border-slate-200 text-text-dark hover:bg-slate-50 font-semibold py-3 px-6 rounded-xl active:scale-95 transition-all"
              >
                Previous Step
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => handleStepNavigation(1)}
                className="ml-auto bg-primary hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto bg-gradient-to-r from-primary to-accent text-white font-medium py-3 px-8 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Submit Proposal
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
