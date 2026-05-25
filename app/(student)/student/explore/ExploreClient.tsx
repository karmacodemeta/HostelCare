'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
  Compass, Search, Filter, MapPin, Building, ShieldCheck, 
  Wifi, HelpCircle, Check, Loader2, ArrowRight, X, Sparkles, 
  Map, FileText, Upload, CreditCard, Mail, Users, CheckCircle, Info, Lock
} from 'lucide-react';
import { getExploreProperties, submitKYCDocumentation, signLeaseAgreementDocument } from '@/app/actions/explore';
import { addStudent } from '@/app/actions/student';
import { toast } from 'sonner';

const BUILDING_IMAGE = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';
const ROOM_IMAGE = 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80';
const WASHROOM_IMAGE = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80';

interface ExploreClientProps {
  initialProperties: any[];
  loggedStudent: any | null;
}

export default function ExploreClient({ initialProperties, loggedStudent }: ExploreClientProps) {
  const [properties, setProperties] = useState<any[]>(initialProperties);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  
  // Search & Filter states
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('all');
  const [type, setType] = useState('all');
  const [budget, setBudget] = useState(12000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Booking Flow states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [activeRoom, setActiveRoom] = useState<any | null>(null);

  // Self Onboarding Profile states (if student logged in but profile mapping doesn't exist yet)
  const [onboardName, setOnboardName] = useState(loggedStudent?.name || '');
  const [onboardContact, setOnboardContact] = useState(loggedStudent?.contactNumber || '');
  const [onboardGuardian, setOnboardGuardian] = useState(loggedStudent?.guardian || '');
  const [onboardGuardianContact, setOnboardGuardianContact] = useState(loggedStudent?.guardianContact || '');
  const [onboardAddress, setOnboardAddress] = useState(loggedStudent?.address || '');

  // KYC form states
  const [kycAadhaar, setKycAadhaar] = useState('');
  const [kycPan, setKycPan] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState('');
  const [uploadedAadhaarFront, setUploadedAadhaarFront] = useState('');
  const [uploadedAadhaarBack, setUploadedAadhaarBack] = useState('');
  const [kycLoading, setKycLoading] = useState(false);

  // Agreement states
  const [agreementSignature, setAgreementSignature] = useState('');
  const [agreementLoading, setAgreementLoading] = useState(false);

  // Simulated Checkout states
  const [checkoutMode, setCheckoutMode] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Simulated Email Notification states
  const [showEmailReceipt, setShowEmailReceipt] = useState(false);

  // Focus map marker
  const [focusedBranchId, setFocusedBranchId] = useState<string | null>(null);

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = React.useRef<any>(null);

  // Dynamic Leaflet Loader from CDN
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Avoid duplicate stylesheet injection
    const link = document.querySelector('link[href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]') as HTMLLinkElement | null;
    if (!link) {
      const newLink = document.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(newLink);
    }

    // Avoid duplicate script injection
    const script = document.querySelector('script[src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"]') as HTMLScriptElement | null;
    if (!script) {
      const newScript = document.createElement('script');
      newScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      newScript.async = true;
      newScript.onload = () => {
        setLeafletLoaded(true);
      };
      document.body.appendChild(newScript);
    } else {
      setLeafletLoaded(true);
    }
  }, []);

  // Map initialization & synchronization
  useEffect(() => {
    if (!leafletLoaded || typeof window === 'undefined' || !(window as any).L) return;
    const L = (window as any).L;

    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer) return;

    // Clear old instance to avoid re-init error
    if ((mapContainer as any)._leaflet_id) {
      return;
    }

    // Determine map center based on city or default Noida coordinates
    let initialCenter: [number, number] = [28.6297, 77.3721]; // Noida Sector 62
    if (city === 'Patna') {
      initialCenter = [25.6186, 85.1163]; // Patna Boring Road
    } else if (properties.length > 0) {
      const activeProp = properties.find(p => p.city.toLowerCase() === city.toLowerCase()) || properties[0];
      initialCenter = [activeProp.latitude || 28.6297, activeProp.longitude || 77.3721];
    }

    const map = L.map('leaflet-map', {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(initialCenter, city === 'Patna' ? 12 : 12);

    mapRef.current = map;

    // Premium dark mode map tiles from CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 18
    }).addTo(map);

    // Plot beautiful color-coded price pin markers
    properties.forEach((prop) => {
      if (!prop.latitude || !prop.longitude) return;

      let markerColor = '#6366f1'; // Unisex/Co-Living
      if (prop.propertyType === 'pg_boys') markerColor = '#3b82f6'; // Boys
      if (prop.propertyType === 'pg_girls') markerColor = '#ec4899'; // Girls

      const isFocused = focusedBranchId === prop._id;

      // Render glowing HTML marker pin matching standard UI startingPrice
      const icon = L.divIcon({
        className: 'custom-leaflet-pin-wrapper',
        html: `
          <div style="
            background-color: ${isFocused ? '#4f46e5' : '#09090b'};
            color: #ffffff;
            padding: 5px 11px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 800;
            border: 2px solid ${markerColor};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 5px;
            transform: translate(-50%, -100%);
            transition: all 0.2s ease-in-out;
            ${isFocused ? 'transform: translate(-50%, -100%) scale(1.08); font-size: 10.5px; border-color: #ffffff;' : ''}
          ">
            <span style="width: 7px; height: 7px; background-color: ${markerColor}; border-radius: 50%; display: inline-block;"></span>
            <span>₹${(prop.startingPrice / 1000).toFixed(1)}k</span>
          </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 24],
      });

      const marker = L.marker([prop.latitude, prop.longitude], { icon }).addTo(map);

      // Add descriptive popup containing name, region, and vacancy count
      marker.bindPopup(`
        <div style="color: #09090b; font-family: system-ui, -apple-system, sans-serif; padding: 6px; width: 175px;">
          <span style="
            display: inline-block;
            font-size: 8px;
            text-transform: uppercase;
            font-weight: 800;
            padding: 1px 5px;
            border-radius: 3px;
            margin-bottom: 5px;
            background-color: ${markerColor}20;
            color: ${markerColor};
            border: 1px solid ${markerColor}40;
          ">
            ${prop.propertyType === 'pg_boys' ? 'Boys PG' : prop.propertyType === 'pg_girls' ? 'Girls PG' : 'Co-Living'}
          </span>
          <h4 style="margin: 0 0 3px 0; font-weight: 800; font-size: 12px; line-height: 1.2;">${prop.name}</h4>
          <p style="margin: 0 0 8px 0; font-size: 9px; color: #71717a;">📍 ${prop.area}, ${prop.city}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f4f4f5; padding-top: 5px;">
            <span style="font-weight: 800; font-size: 11px; color: #4f46e5;">₹${prop.startingPrice.toLocaleString()} <span style="font-size: 8px; font-weight: 500; color: #71717a;">/mo</span></span>
            <span style="font-size: 8px; font-weight: 700; color: #15803d; background: #dcfce7; padding: 2px 5px; border-radius: 3px;">
              ${prop.capacity - prop.occupiedBeds} Beds Left
            </span>
          </div>
        </div>
      `, {
        closeButton: false,
        offset: L.point(0, -10)
      });

      marker.on('click', () => {
        setFocusedBranchId(prop._id);
        map.setView([prop.latitude, prop.longitude], 13, {
          animate: true,
          duration: 0.8
        });
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [leafletLoaded, properties, city]);

  // Fly/pan map to focused card's coordinates dynamically
  useEffect(() => {
    if (!leafletLoaded || !focusedBranchId || !mapRef.current) return;
    const prop = properties.find(p => p._id === focusedBranchId);
    if (prop && prop.latitude && prop.longitude) {
      mapRef.current.setView([prop.latitude, prop.longitude], 13, {
        animate: true,
        duration: 0.8
      });
    }
  }, [focusedBranchId, properties, leafletLoaded]);

  const amenitiesOptions = [
    'High-Speed WiFi', 'AC Rooms', 'Power Backup', 
    'CCTV Security', 'Daily Cleaning', 'Organic Mess Food',
    'Laundry Service', 'RO Purified Water', 'GYM Access'
  ];

  const handleSearch = async () => {
    setLoading(true);
    const res = await getExploreProperties(search, type, city, budget, selectedAmenities);
    setProperties(res);
    setLoading(false);
  };

  useEffect(() => {
    handleSearch();
  }, [city, type, budget, selectedAmenities]);

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleStartBooking = (property: any, room: any) => {
    setSelectedProperty(property);
    setActiveRoom(room);
    
    // Determine initial booking step based on user profile mapping
    if (loggedStudent) {
      if (loggedStudent.kycStatus === 'verified') {
        setBookingStep(3); // Go straight to agreement
      } else {
        setBookingStep(2); // Go to KYC documentation upload
      }
    } else {
      setBookingStep(1); // Needs to create/onboard PG Profile
    }
    
    setIsBookingOpen(true);
  };

  const handleSelfOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardName || !onboardContact || !onboardAddress || !onboardGuardian) {
      toast.error('Please enter name, contact, address and guardian.');
      return;
    }

    setLoading(true);
    // Build simulated onboarding form action
    const form = new FormData();
    form.append('name', onboardName);
    form.append('contactNumber', onboardContact);
    form.append('guardian', onboardGuardian);
    form.append('guardianContact', onboardGuardianContact);
    form.append('address', onboardAddress);
    form.append('roomNo', activeRoom.roomNo);
    form.append('rent', activeRoom.rent.toString());
    form.append('dues', activeRoom.rent.toString());
    form.append('advanceAmount', activeRoom.rent.toString()); // standard 1 month security
    form.append('admissionDate', new Date().toISOString().slice(0, 10));
    form.append('branchId', selectedProperty._id);

    const res = await addStudent({ success: false, message: '' }, form);
    setLoading(false);

    if (res.success) {
      toast.success('PG Profile Registered! Now let\'s complete your secure KYC verification.');
      // Simulate reload of student details
      setBookingStep(2);
    } else {
      toast.error(res.message || 'Onboarding failed');
    }
  };

  const handleUploadKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycAadhaar || !kycPan) {
      toast.error('Aadhaar and PAN details are mandatory.');
      return;
    }

    setKycLoading(true);
    // Simulated upload fallback urls
    const photo = uploadedPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
    const front = uploadedAadhaarFront || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
    const back = uploadedAadhaarBack || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

    // Find student ID (fallback to loggedStudent._id or simulate student query)
    const targetStudentId = loggedStudent?._id || '6655cba1234567890abcdef1';

    const res = await submitKYCDocumentation(targetStudentId, kycAadhaar, kycPan, photo, front, back);
    setKycLoading(false);

    if (res.success) {
      toast.success(res.message);
      setBookingStep(3); // Proceed to Lease Agreement
    } else {
      toast.error(res.message);
    }
  };

  const handleSignAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreementSignature) {
      toast.error('Signature name is required.');
      return;
    }

    setAgreementLoading(true);
    const targetStudentId = loggedStudent?._id || '6655cba1234567890abcdef1';
    
    const res = await signLeaseAgreementDocument(targetStudentId, agreementSignature);
    setAgreementLoading(false);

    if (res.success) {
      toast.success(res.message);
      setBookingStep(4); // Proceed to simulated Razorpay checkout
    } else {
      toast.error(res.message);
    }
  };

  const handleSimulatedPayment = () => {
    setCheckoutLoading(true);
    setTimeout(() => {
      setCheckoutLoading(false);
      setBookingStep(5); // Booking complete & dynamic email confirmation triggers
      setShowEmailReceipt(true);
      toast.success('Dues cleared & Booking confirmed! Security lease generated successfully.');
    }, 3000);
  };

  const getPropertyTypeLabel = (pType: string) => {
    switch (pType) {
      case 'pg_boys': return 'Boys PG / Room';
      case 'pg_girls': return 'Girls PG / Room';
      case 'pg_unisex': return 'Co-Living (Unisex)';
      case 'co_living': return 'Co-Living / PG';
      default: return 'Student Hostel';
    }
  };

  const getPropertyTypeBadgeColor = (pType: string) => {
    switch (pType) {
      case 'pg_boys': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400';
      case 'pg_girls': return 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/20 dark:text-pink-400';
      case 'pg_unisex': return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400';
      default: return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            Explore PGs & Bookings
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">Discover premium student PG properties, complete KYC, and book instantly on maps.</p>
        </div>
      </div>

      {/* Modern filters panel */}
      <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="search-input" className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Search Keyword</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
              <Input
                id="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Boring Road, Sector 62..."
                className="pl-9 h-10 border-zinc-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filter-city" className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Select City</Label>
            <select
              id="filter-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-zinc-150 focus:outline-none"
            >
              <option value="all">All Cities</option>
              <option value="Noida">Noida</option>
              <option value="Patna">Patna</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filter-type" className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">PG Type</Label>
            <select
              id="filter-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-zinc-150 focus:outline-none"
            >
              <option value="all">All Property Types</option>
              <option value="pg_boys">Boys PGs</option>
              <option value="pg_girls">Girls PGs</option>
              <option value="co_living">Co-Living / Unisex</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Search className="w-4 h-4 mr-1" />}
              Filter Listings
            </Button>
          </div>
        </div>

        {/* Budget Range & Amenities List */}
        <div className="pt-3 border-t grid gap-6 md:grid-cols-3 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              <span>Budget Cap (/mo)</span>
              <span className="text-indigo-600 dark:text-indigo-400">₹{budget.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={4000}
              max={15000}
              step={500}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <span className="font-bold text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Amenities Filter</span>
            <div className="flex flex-wrap gap-1.5">
              {amenitiesOptions.map((a) => {
                const isSelected = selectedAmenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1 rounded-full border text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/20 text-indigo-600 dark:border-indigo-400' 
                        : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-850'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Main split display: property list left & map right */}
      <div className="grid gap-6 lg:grid-cols-5 items-start">
        
        {/* PG Listings Grid (Left 3 cols) */}
        <div className="lg:col-span-3 space-y-4 max-h-[700px] overflow-y-auto pr-1">
          {properties.length === 0 ? (
            <Card className="p-8 text-center text-sm text-zinc-400 italic bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
              No matching PG properties found in Noida or Patna. Try adjusting filters! 🛡️
            </Card>
          ) : (
            properties.map((prop) => {
              const occupancy = prop.capacity > 0 ? Math.round((prop.occupiedBeds / prop.capacity) * 100) : 0;
              const isFocused = focusedBranchId === prop._id;
              
              return (
                <Card 
                  key={prop._id}
                  onClick={() => setFocusedBranchId(prop._id)}
                  className={`p-4 border shadow-sm transition-all duration-300 grid sm:grid-cols-3 gap-4 bg-white dark:bg-zinc-900 hover:shadow-md cursor-pointer ${
                    isFocused ? 'border-indigo-500 shadow-indigo-100/50 dark:shadow-none scale-[1.01]' : 'border-neutral-100 dark:border-zinc-800'
                  }`}
                >
                  {/* Building Image */}
                  <div className="relative rounded-lg overflow-hidden h-40 bg-zinc-950 sm:col-span-1">
                    <img 
                      src={prop.images?.[0] || BUILDING_IMAGE} 
                      alt={prop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider border bg-white/80 backdrop-blur text-zinc-800 uppercase">
                      ₹{prop.startingPrice?.toLocaleString()}/mo
                    </span>
                  </div>

                  {/* PG Content & details */}
                  <div className="sm:col-span-2 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded border ${getPropertyTypeBadgeColor(prop.propertyType)}`}>
                          {getPropertyTypeLabel(prop.propertyType)}
                        </span>
                        
                        <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> {prop.area}, {prop.city}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-base">{prop.name}</h3>
                      
                      <div className="flex flex-wrap gap-1 text-[9px] font-bold text-zinc-400 uppercase">
                        {prop.amenities?.slice(0, 4).map((a: string) => (
                          <span key={a} className="bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-semibold">Available Beds</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">
                          {prop.capacity - prop.occupiedBeds} vacancy ({occupancy}% full)
                        </span>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProperty(prop);
                        }}
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-semibold border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 cursor-pointer"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Dynamic Simulated Price Pin Map (Right 2 cols) */}
        <div className="lg:col-span-2">
          <Card className="p-4 bg-zinc-950 text-white border-zinc-800 shadow-xl h-[480px] flex flex-col justify-between relative overflow-hidden rounded-2xl">
            {/* Dark grid canvas backdrop simulating digital premium PG maps */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-indigo-950 via-zinc-950 to-transparent pointer-events-none" />

            <div className="relative flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">PG Price Pin Map Explorer</span>
              </div>
              <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded font-bold text-indigo-400">Simulated GPS Live</span>
            </div>

            {/* Map Plot Space */}
            <div className="flex-1 w-full h-full relative rounded-xl overflow-hidden mt-2 z-10 border border-zinc-800">
              <div id="leaflet-map" className="w-full h-full" />
              
              <div className="text-center absolute bottom-4 left-4 right-4 z-20 text-[10px] text-zinc-300 bg-zinc-950/90 backdrop-blur p-2 rounded-lg border border-zinc-800 flex items-center gap-1.5 justify-center pointer-events-none">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Real-time GPS PG Locator: pins show starting monthly rent. Click card/pin to pan map!</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Property specs details dialogue */}
      <Dialog open={!!selectedProperty && !isBookingOpen} onOpenChange={() => setSelectedProperty(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedProperty && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded border ${getPropertyTypeBadgeColor(selectedProperty.propertyType)}`}>
                    {getPropertyTypeLabel(selectedProperty.propertyType)}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {selectedProperty.area}, {selectedProperty.city}
                  </span>
                </div>
                <DialogTitle className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">{selectedProperty.name}</DialogTitle>
                <DialogDescription>
                  Detailed property galleries, dimensions, amenities, and lease structures.
                </DialogDescription>
              </DialogHeader>

              {/* Photo grid of interior exterior washroom */}
              <div className="grid grid-cols-3 gap-2 h-44 rounded-xl overflow-hidden bg-neutral-900">
                <div className="col-span-1 h-full relative group">
                  <img src={selectedProperty.images?.[0] || BUILDING_IMAGE} alt="Exterior" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 text-[9px] bg-black/60 px-2 py-0.5 rounded text-white font-bold">Exterior</span>
                </div>
                <div className="col-span-1 h-full relative group">
                  <img src={selectedProperty.images?.[1] || ROOM_IMAGE} alt="Room interior" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 text-[9px] bg-black/60 px-2 py-0.5 rounded text-white font-bold">Interior Room</span>
                </div>
                <div className="col-span-1 h-full relative group">
                  <img src={selectedProperty.images?.[2] || WASHROOM_IMAGE} alt="Attached washroom" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 text-[9px] bg-black/60 px-2 py-0.5 rounded text-white font-bold">Washroom</span>
                </div>
              </div>

              {/* Spec columns: Amenities, Dimensions, Washrooms */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="p-4 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 space-y-2">
                  <h4 className="font-extrabold text-xs text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b pb-1">PG Building Specifications</h4>
                  <div className="text-xs space-y-2 pt-1 text-zinc-600 dark:text-zinc-400">
                    <p className="flex justify-between"><span>Default Sharing Tiers:</span> <span className="font-bold text-zinc-800 dark:text-zinc-200">Single, Double, Triple sharing</span></p>
                    <p className="flex justify-between"><span>Typical Room Size:</span> <span className="font-bold text-zinc-800 dark:text-zinc-200">180 - 250 Sq Ft</span></p>
                    <p className="flex justify-between"><span>Bathroom Configurations:</span> <span className="font-bold text-zinc-800 dark:text-zinc-200">Private / Attached shared washrooms</span></p>
                    <p className="flex justify-between"><span>Distance to Metro/Hubs:</span> <span className="font-bold text-zinc-800 dark:text-zinc-200">1.2 km (Approx)</span></p>
                  </div>
                </Card>

                <Card className="p-4 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 space-y-2">
                  <h4 className="font-extrabold text-xs text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b pb-1">Facilities Provided</h4>
                  <div className="flex flex-wrap gap-1 text-[9px] font-bold text-zinc-600 dark:text-zinc-400 pt-1">
                    {selectedProperty.amenities?.map((a: string) => (
                      <span key={a} className="bg-zinc-200 dark:bg-zinc-800/80 px-2 py-1 rounded flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-indigo-500" /> {a}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Available Rooms List with exact sizes & washroom configs */}
              <div className="space-y-3.5">
                <span className="text-[10px] uppercase font-extrabold text-zinc-400 dark:text-zinc-500 tracking-wider">Available Rooms list:</span>
                
                <div className="space-y-2">
                  {selectedProperty.rooms?.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">No vacancies registered for this PG property.</p>
                  ) : (
                    selectedProperty.rooms?.map((room: any) => {
                      const occupancy = room.students?.length || 0;
                      const bedsAvailable = room.capacity - occupancy;
                      const isFull = bedsAvailable <= 0;

                      return (
                        <div 
                          key={room._id} 
                          className="p-4 rounded-xl border border-neutral-100 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-4 transition hover:bg-neutral-50 dark:hover:bg-zinc-900/50"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Room {room.roomNo}</span>
                              <span className="text-[9px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.25 rounded font-bold uppercase">
                                {room.type?.replace('_', ' ')} &bull; {room.sharingType}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 space-y-0.5">
                              <p>Size: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{room.sizeSqFt || 180} SqFt</span> &bull; Bathroom: <span className="font-semibold text-zinc-700 dark:text-zinc-300">Attached ({room.washroomType?.replace('_', ' ')})</span></p>
                              <p>Room Specs: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{room.specifications?.join(', ') || 'Balcony, Wardrobes, Study desk'}</span></p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">₹{room.rent?.toLocaleString()}/mo</span>
                            <Button
                              onClick={() => handleStartBooking(selectedProperty, room)}
                              size="sm"
                              disabled={isFull}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold h-7 cursor-pointer"
                            >
                              Apply & Book
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modern Multi-Step PG Application & Booking Workflow Modal */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          {selectedProperty && activeRoom && (
            <div className="space-y-6">
              {/* Stepper visual guide */}
              <div className="border-b pb-4 flex items-center justify-between gap-2 text-xs font-bold text-zinc-400 select-none">
                <span className={bookingStep === 1 ? 'text-indigo-600 animate-pulse' : bookingStep > 1 ? 'text-emerald-500' : ''}>1. Pg Profile</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-300" />
                <span className={bookingStep === 2 ? 'text-indigo-600 animate-pulse' : bookingStep > 2 ? 'text-emerald-500' : ''}>2. KYC Docs</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-300" />
                <span className={bookingStep === 3 ? 'text-indigo-600 animate-pulse' : bookingStep > 3 ? 'text-emerald-500' : ''}>3. Lease Contract</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-300" />
                <span className={bookingStep === 4 ? 'text-indigo-600 animate-pulse' : bookingStep > 4 ? 'text-emerald-500' : ''}>4. Secure Payment</span>
              </div>

              {/* STEP 1: Student PG Profile self onboarding */}
              {bookingStep === 1 && (
                <form onSubmit={handleSelfOnboard} className="space-y-4 py-2">
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                      <Users className="w-5 h-5 text-indigo-500" /> Step 1: Create PG Admission Profile
                    </h3>
                    <p className="text-xs text-zinc-500">Self-onboard your profile for Room {activeRoom.roomNo} at {selectedProperty.name}.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="onboard-name" className="text-xs font-semibold text-zinc-500 uppercase">Resident Name</Label>
                      <Input id="onboard-name" value={onboardName} onChange={(e) => setOnboardName(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="onboard-contact" className="text-xs font-semibold text-zinc-500 uppercase">Contact Number</Label>
                      <Input id="onboard-contact" value={onboardContact} onChange={(e) => setOnboardContact(e.target.value)} required />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="onboard-guardian" className="text-xs font-semibold text-zinc-500 uppercase">Emergency Contact Name (Guardian)</Label>
                      <Input id="onboard-guardian" value={onboardGuardian} onChange={(e) => setOnboardGuardian(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="onboard-gcontact" className="text-xs font-semibold text-zinc-500 uppercase">Guardian Phone</Label>
                      <Input id="onboard-gcontact" value={onboardGuardianContact} onChange={(e) => setOnboardGuardianContact(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="onboard-address" className="text-xs font-semibold text-zinc-500 uppercase">Permanent Home Address</Label>
                    <textarea
                      id="onboard-address"
                      value={onboardAddress}
                      onChange={(e) => setOnboardAddress(e.target.value)}
                      rows={3}
                      required
                      className="w-full p-3 text-sm rounded-lg border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none text-zinc-800 dark:text-zinc-100 resize-none"
                    />
                  </div>

                  <DialogFooter className="border-t pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsBookingOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                      {loading && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Save Profile
                    </Button>
                  </DialogFooter>
                </form>
              )}

              {/* STEP 2: KYC Documentation Upload */}
              {bookingStep === 2 && (
                <form onSubmit={handleUploadKYC} className="space-y-4 py-2">
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                      <ShieldCheck className="w-5 h-5 text-indigo-500" /> Step 2: KYC Verification Portal
                    </h3>
                    <p className="text-xs text-zinc-500">Government identity validation is mandatory for Indian student housing compliance.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="kyc-aadhaar" className="text-xs font-semibold text-zinc-500 uppercase">Aadhaar Card Number</Label>
                      <Input id="kyc-aadhaar" value={kycAadhaar} onChange={(e) => setKycAadhaar(e.target.value)} placeholder="e.g. 1234 5678 9012" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="kyc-pan" className="text-xs font-semibold text-zinc-500 uppercase">Permanent Account Number (PAN)</Label>
                      <Input id="kyc-pan" value={kycPan} onChange={(e) => setKycPan(e.target.value)} placeholder="e.g. ABCDE 1234 F" required />
                    </div>
                  </div>

                  {/* Image uploads grids */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-center space-y-1 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-950 transition">
                      <Upload className="w-5 h-5 text-zinc-400 mx-auto" />
                      <span className="text-[9px] font-bold text-zinc-500 uppercase block">Resident Photo</span>
                    </div>
                    <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-center space-y-1 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-950 transition">
                      <Upload className="w-5 h-5 text-zinc-400 mx-auto" />
                      <span className="text-[9px] font-bold text-zinc-500 uppercase block">Aadhaar Front</span>
                    </div>
                    <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-center space-y-1 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-950 transition">
                      <Upload className="w-5 h-5 text-zinc-400 mx-auto" />
                      <span className="text-[9px] font-bold text-zinc-500 uppercase block">Aadhaar Back</span>
                    </div>
                  </div>

                  <DialogFooter className="border-t pt-4">
                    <Button type="button" variant="outline" onClick={() => setBookingStep(1)}>Back</Button>
                    <Button type="submit" disabled={kycLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                      {kycLoading && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Submit KYC Documents
                    </Button>
                  </DialogFooter>
                </form>
              )}

              {/* STEP 3: Protected Lease Agreement signature */}
              {bookingStep === 3 && (
                <form onSubmit={handleSignAgreement} className="space-y-4 py-2">
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                      <FileText className="w-5 h-5 text-indigo-500" /> Step 3: Legally Protected Lease Agreement
                    </h3>
                    <p className="text-xs text-zinc-500">Please read carefully and sign the lease agreement from Owner to Resident.</p>
                  </div>

                  {/* Legally protective contract clauses scroll box */}
                  <Card className="p-4 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 h-44 overflow-y-auto text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400 space-y-3 font-mono">
                    <p className="font-bold border-b pb-1 uppercase tracking-wider text-zinc-850 dark:text-zinc-200">STANDARD RESIDENTIAL LICENSE AGREEMENT</p>
                    <p>This License agreement is made between PG Owner of <span className="font-bold">{selectedProperty.name}</span> ("Licensor") and <span className="font-bold">{onboardName || loggedStudent?.name || ''}</span> ("Licensee") for allocating space in <span className="font-bold">Room {activeRoom.roomNo}</span>.</p>
                    
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">1. DUES & LATE FEES PAYABLE</p>
                    <p>Rent is payable on or before the 5th of every calendar month. Failure to pay before the due date will result in a late fee surcharge of 5% of the monthly rent compounded weekly.</p>
                    
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">2. LIABILITY FOR PROPERTY DAMAGE</p>
                    <p>The Licensee will be solely liable for any physical damage to rooms, washrooms, furniture, and electrical fittings in their allocated area. Recovery costs will be deducted from the advance security deposit or charged separately.</p>

                    <p className="font-bold text-zinc-800 dark:text-zinc-200">3. SECURITY DEPOSIT REFUND</p>
                    <p>Refund of security deposit requires a minimum 30-day formal notice via the student portal dashboard. Failure to serve notice results in complete forfeiture of the security deposit.</p>

                    <p className="font-bold text-zinc-800 dark:text-zinc-200">4. SOFTWARE PLATFORM LIABILITY WAIVER</p>
                    <p>HostelCare operates purely as a PG management utility. HostelCare, its developers, and parent agencies are completely indemnified from any legal disputes, lease violations, security breaches, or damage recoveries arising between Licensor (Owner) and Licensee (Resident).</p>
                  </Card>

                  <div className="space-y-1.5">
                    <Label htmlFor="sig-name" className="text-xs font-semibold text-zinc-500 uppercase">Type Full Legal Name as Digital Signature</Label>
                    <Input 
                      id="sig-name" 
                      value={agreementSignature} 
                      onChange={(e) => setAgreementSignature(e.target.value)} 
                      placeholder="e.g. Ramesh Kumar" 
                      required 
                    />
                  </div>

                  <DialogFooter className="border-t pt-4">
                    <Button type="button" variant="outline" onClick={() => setBookingStep(2)}>Back</Button>
                    <Button type="submit" disabled={agreementLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                      {agreementLoading && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Digitally Sign Contract
                    </Button>
                  </DialogFooter>
                </form>
              )}

              {/* STEP 4: Razorpay simulated gateway */}
              {bookingStep === 4 && (
                <div className="space-y-4 py-2">
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                      <CreditCard className="w-5 h-5 text-indigo-500" /> Step 4: Secure PG Advance Checkout
                    </h3>
                    <p className="text-xs text-zinc-500">Pay your security deposit & first month rent via secure gateway.</p>
                  </div>

                  <div className="p-4 rounded-xl border bg-zinc-50 dark:bg-zinc-950 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">First Month Rent (Room {activeRoom.roomNo}):</span>
                      <span className="font-bold">₹{activeRoom.rent?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-zinc-500">1 Month Security Deposit (Refundable):</span>
                      <span className="font-bold">₹{activeRoom.rent?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-sm pt-1 text-indigo-600">
                      <span>Total Amount Payable:</span>
                      <span>₹{(activeRoom.rent * 2)?.toLocaleString()}</span>
                    </div>
                  </div>

                  {checkoutLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                      <p className="font-bold text-sm">Processing online transaction safely...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setCheckoutMode('upi')}
                          className={`p-3 rounded-lg border text-xs font-semibold cursor-pointer ${
                            checkoutMode === 'upi' ? 'border-indigo-600 bg-indigo-50/20' : 'border-zinc-200'
                          }`}
                        >
                          UPI / GPay
                        </button>
                        <button
                          onClick={() => setCheckoutMode('card')}
                          className={`p-3 rounded-lg border text-xs font-semibold cursor-pointer ${
                            checkoutMode === 'card' ? 'border-indigo-600 bg-indigo-50/20' : 'border-zinc-200'
                          }`}
                        >
                          Credit Card
                        </button>
                        <button
                          onClick={() => setCheckoutMode('netbanking')}
                          className={`p-3 rounded-lg border text-xs font-semibold cursor-pointer ${
                            checkoutMode === 'netbanking' ? 'border-indigo-600 bg-indigo-50/20' : 'border-zinc-200'
                          }`}
                        >
                          Netbanking
                        </button>
                      </div>

                      <Button
                        onClick={handleSimulatedPayment}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                      >
                        Authorize & Pay ₹{(activeRoom.rent * 2)?.toLocaleString()}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Success & dynamic email alert simulator */}
              {bookingStep === 5 && (
                <div className="py-6 text-center space-y-4 flex flex-col items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">PG Room Booked Successfully!</h3>
                    <p className="text-xs text-zinc-500">Your seat is locked at {selectedProperty.name} &bull; Room {activeRoom.roomNo}.</p>
                  </div>

                  {showEmailReceipt && (
                    <Card className="p-4 w-full bg-indigo-50/40 dark:bg-zinc-950/80 border-indigo-100 dark:border-zinc-900 text-left text-[11px] leading-relaxed space-y-3 font-mono">
                      <div className="flex items-center justify-between border-b pb-1 text-[10px] text-zinc-400">
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-indigo-500" /> Transactional Email Dispatcher</span>
                        <span>AGREED_SIGNED</span>
                      </div>
                      <p><span className="font-bold">TO student:</span> {loggedStudent?.email || 'resident@hostelcare.com'}</p>
                      <p><span className="font-bold">TO owner:</span> PG-management@hostelcare.com</p>
                      <p className="font-bold uppercase tracking-wider text-emerald-600">Attachment: LEASE_AGREEMENT_PROTECTED.pdf (Generated)</p>
                      <p className="text-[10px] text-zinc-500 border-t pt-1">Formal check-in voucher is dispatched. Check-in with Aadhaar verification completes onboarding.</p>
                    </Card>
                  )}

                  <Button
                    onClick={() => {
                      setIsBookingOpen(false);
                      setIsBookingOpen(false);
                      window.location.reload();
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    Go to Portal Dashboard
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
