import React, { useState } from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  Users2,
  Plus,
  Star,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Trash2,
  Filter,
  Check,
} from 'lucide-react';
import { Vendor } from '../types';

export const VendorsPage: React.FC = () => {
  const { vendors, addVendor, deleteVendor, activeEvent } = useSaanjh();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Vendor>>({
    name: '',
    category: 'Catering',
    city: 'Mumbai',
    priceTier: 'ULTRA_LUXURY',
    status: 'CURATED',
    contactPerson: '',
    phone: '',
    email: '',
    portfolioLink: '',
    rating: 4.9,
    pastEventsWorked: 'Saanjh Udaipur Season 2025',
    notes: 'Exclusive heritage master craft',
    specialty: 'Royal banquet dining',
    tasteMatchScore: 96,
  });

  const categories = [
    'ALL',
    'Scenography & Décor',
    'Catering & Khansamas',
    'Couture Styling & Makeup',
    'Photography & Cinema',
    'Floral Architecture',
    'Acoustic Artists & Music',
    'Hospitality & Transport',
  ];

  const filteredVendors = vendors.filter((v) => {
    if (selectedCategory === 'ALL') return true;
    return v.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newVendor: Vendor = {
      id: `vnd-${Date.now()}`,
      name: formData.name,
      category: formData.category || 'Décor',
      city: formData.city || 'Udaipur',
      priceTier: formData.priceTier as any,
      status: formData.status as any,
      contactPerson: formData.contactPerson || 'Vendor Lead',
      phone: formData.phone || '+91 98000 00000',
      email: formData.email || 'info@vendor.com',
      portfolioLink: formData.portfolioLink || 'https://instagram.com/saanjhweddings',
      rating: Number(formData.rating) || 5.0,
      pastEventsWorked: formData.pastEventsWorked || 'New Partner',
      notes: formData.notes || 'Curated partner',
      specialty: formData.specialty || 'Luxury Weddings',
      tasteMatchScore: Number(formData.tasteMatchScore) || 94,
    };

    addVendor(newVendor);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">
            The Curated Directory
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#3B0D11]">
            Curated Luxury Vendors & Guilds
          </h1>
          <p className="text-xs text-[#706E6B] mt-0.5">
            Pre-audited artisanal masters, royal khansamas, couture stylists, and master scenographers.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5 border border-[#C5A059]/40 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4 text-[#E6CA65]" />
          <span>Curate New Vendor</span>
        </button>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#DFD7C2]">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-serif whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#3B0D11] text-[#FBF9F5] font-semibold border border-[#C5A059]/50'
                : 'bg-[#F5F1E8] text-[#706E6B] hover:text-[#3B0D11] hover:bg-[#EAE3D2]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => {
          const tierColor =
            vendor.priceTier === 'ROYAL'
              ? 'bg-[#3B0D11] text-[#E6CA65]'
              : vendor.priceTier === 'ULTRA_LUXURY'
              ? 'bg-[#C5A059]/20 text-[#3B0D11]'
              : 'bg-[#1E382B]/10 text-[#1E382B]';

          return (
            <div
              key={vendor.id}
              className="bg-[#FBF9F5] border border-[#DFD7C2] hover:border-[#C5A059] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#C5A059] block">
                      {vendor.category}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#3B0D11] mt-0.5">
                      {vendor.name}
                    </h3>
                  </div>

                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md ${tierColor}`}
                  >
                    {vendor.priceTier}
                  </span>
                </div>

                <p className="text-xs text-[#444] mt-2 leading-relaxed">
                  {vendor.specialty}
                </p>

                {/* Taste Match Indicator */}
                <div className="mt-4 bg-[#F5F1E8] border border-[#DFD7C2] rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C5A059]" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#706E6B] block">
                        Taste Match (AI)
                      </span>
                      <span className="text-[11px] text-[#333]">
                        Fit for {activeEvent?.style || 'Royal Heritage'}
                      </span>
                    </div>
                  </div>
                  <div className="font-serif text-base font-bold text-[#1E382B]">
                    {vendor.tasteMatchScore}%
                  </div>
                </div>

                {/* Contact & Location Details */}
                <div className="mt-4 space-y-1.5 text-xs text-[#666]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{vendor.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>
                      {vendor.contactPerson} ({vendor.phone})
                    </span>
                  </div>
                  {vendor.portfolioLink && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-[#C5A059]" />
                      <a
                        href={vendor.portfolioLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#3B0D11] hover:underline truncate"
                      >
                        {vendor.portfolioLink}
                      </a>
                    </div>
                  )}
                </div>

                {vendor.notes && (
                  <div className="mt-3 text-[11px] text-[#555] bg-[#3B0D11]/5 p-2 rounded-md italic">
                    "{vendor.notes}"
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-3 border-t border-[#DFD7C2] flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-bold text-[#3B0D11]">
                  <Star className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
                  <span>{vendor.rating} / 5.0</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteVendor(vendor.id)}
                    className="p-1.5 text-[#706E6B] hover:text-[#B87A81] rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm bg-[#1E382B]/10 text-[#1E382B]">
                    {vendor.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vendor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FBF9F5] border-2 border-[#C5A059] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#3B0D11] pb-2 border-b border-[#DFD7C2]">
              Add Curated Vendor to House Directory
            </h3>

            <form onSubmit={handleAddVendor} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  placeholder="e.g. House of Mewar Scenography"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Price Tier</label>
                  <select
                    value={formData.priceTier}
                    onChange={(e) => setFormData({ ...formData, priceTier: e.target.value as any })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  >
                    <option value="ROYAL">ROYAL</option>
                    <option value="ULTRA_LUXURY">ULTRA_LUXURY</option>
                    <option value="LUXURY">LUXURY</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  >
                    <option value="CURATED">CURATED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="BOOKED">BOOKED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Specialty</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  placeholder="e.g. Handcrafted royal pavilions & candlelit mandap installations"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DFD7C2]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#706E6B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3B0D11] text-[#FBF9F5] rounded-md font-serif text-xs font-semibold"
                >
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
