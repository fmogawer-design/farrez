import { useListVendors, useCreateVendor, useUpdateVendor, useDeleteVendor, useGetVendor, getGetVendorQueryKey } from "@workspace/api-client-react";
import { Plus, Search, Store, Building2, MoreVertical, Trash2, Edit2, ChevronRight, Activity, AlertCircle, Filter, ArrowUp, ArrowDown } from "lucide-react";
import { useState, KeyboardEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const money = (value: number) =>
  new Intl.NumberFormat("en-KW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

function VendorInsightView({ vendorId }: { vendorId: string }) {
  const { data: vendor, isLoading, isError } = useGetVendor(vendorId, {
    query: {
      queryKey: getGetVendorQueryKey(vendorId),
      enabled: !!vendorId
    }
  });

  if (isLoading) return <div className="h-32 flex items-center justify-center animate-pulse text-primary"><Activity size={24} /></div>;
  if (isError || !vendor) return <div className="h-32 flex items-center justify-center text-error"><AlertCircle size={24} /><span className="ml-2 text-sm">Failed to load insights</span></div>;

  return (
    <div className="flex flex-col gap-4 mt-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
      <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
        <h4 className="font-headline-sm text-on-surface">Historical Insights</h4>
        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-xs text-on-surface-variant font-medium">
          {vendor.insights.comparisonCount} Total Bids
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 p-3 bg-surface-container rounded-lg border border-outline-variant/5">
          <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Win Rate</span>
          <span className="font-metric-md text-primary font-bold">
            {(vendor.insights.recommendationRate * 100).toFixed(0)}%
          </span>
          <span className="text-xs text-on-surface-variant">{vendor.insights.recommendationCount} times recommended</span>
        </div>
        
        <div className="flex flex-col gap-1 p-3 bg-surface-container rounded-lg border border-outline-variant/5">
          <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Avg Net Cost</span>
          <div className="flex items-baseline gap-2">
            <span className="font-metric-md text-on-surface font-bold">
              {money(vendor.insights.averageTotalCost)}
            </span>
            {vendor.insights.totalCostPercentageChange != null && (
              <span className={`text-xs font-medium ${vendor.insights.totalCostPercentageChange > 0 ? "text-error" : "text-primary"}`}>
                {vendor.insights.totalCostPercentageChange > 0 ? "+" : ""}{vendor.insights.totalCostPercentageChange.toFixed(1)}%
              </span>
            )}
          </div>
          <span className="text-xs text-on-surface-variant">KWD verified</span>
        </div>
        
        <div className="col-span-2 flex flex-col gap-1 p-3 bg-surface-container rounded-lg border border-outline-variant/5">
          <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Avg Lead Time</span>
          <span className="font-headline-sm text-on-surface font-bold">
            {vendor.insights.averageDeliveryDays.toFixed(1)} Days
          </span>
        </div>
      </div>
      
      {vendor.insights.previousQuotes.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          <h5 className="text-sm font-semibold text-on-surface-variant">Previous Quotes</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-on-surface-variant uppercase bg-surface-container-high rounded-t-lg">
                <tr>
                  <th className="px-3 py-2 font-medium rounded-tl-lg">Date</th>
                  <th className="px-3 py-2 font-medium">Base Price</th>
                  <th className="px-3 py-2 font-medium">Total Cost</th>
                  <th className="px-3 py-2 font-medium">Delivery</th>
                  <th className="px-3 py-2 font-medium rounded-tr-lg">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {vendor.insights.previousQuotes.map((q) => (
                  <tr key={q.comparisonId} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container transition-colors">
                    <td className="px-3 py-2 text-on-surface-variant">{format(new Date(q.date), "MMM d, yyyy")}</td>
                    <td className="px-3 py-2 text-on-surface font-medium">{money(q.quotedPrice)}</td>
                    <td className="px-3 py-2 text-on-surface font-medium">{money(q.totalCost)}</td>
                    <td className="px-3 py-2 text-on-surface-variant">{q.deliveryDays} d</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        q.outcome === "recommended" ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface-variant"
                      }`}>
                        {q.outcome === "recommended" ? "Won" : "Lost"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Vendors() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("all");
  const [sort, setSort] = useState<"name" | "createdAt" | "updatedAt">("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  
  const { data: vendors, isLoading, refetch } = useListVendors({ 
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    sort,
    order
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  const emptyForm = {
    name: "",
    commercialLicense: "",
    category: "",
    status: "active" as const,
    notes: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVendor.mutate({
      data: {
        ...formData,
        notes: formData.notes || undefined,
      }
    }, {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        setIsAddOpen(false);
        setFormData(emptyForm);
        toast({ title: "Vendor added successfully." });
      },
      onError: () => {
        toast({ title: "Failed to add vendor", variant: "destructive" });
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;
    
    updateVendor.mutate({
      id: editingVendor.id,
      data: {
        ...formData,
        notes: formData.notes || undefined,
      }
    }, {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        setIsEditOpen(false);
        setEditingVendor(null);
        toast({ title: "Vendor updated successfully." });
      },
      onError: () => {
        toast({ title: "Failed to update vendor", variant: "destructive" });
      }
    });
  };

  const handleDelete = () => {
    if (!deletingId) return;
    deleteVendor.mutate({ id: deletingId }, {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        if (selectedVendorId === deletingId) setSelectedVendorId(null);
        setDeletingId(null);
        toast({ title: "Vendor archived." });
      },
      onError: () => {
        toast({ title: "Failed to archive vendor", variant: "destructive" });
      }
    });
  };

  const openEdit = (vendor: any) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name || "",
      commercialLicense: vendor.commercialLicense || "",
      category: vendor.category || "",
      status: vendor.status || "active",
      notes: vendor.notes || "",
    });
    setIsEditOpen(true);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between pt-space-xs">
        <div className="flex flex-col gap-space-xs">
          <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary/10 w-max">
            <Store size={16} className="text-secondary" />
            <span className="font-label-sm text-label-sm text-secondary tracking-wide">
              Vendor Directory
            </span>
          </div>
          <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight">
            Registered Suppliers
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage approved commercial partners and their track records.
          </p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button aria-label="New Vendor" title="New Vendor" className="h-[44px] w-[44px] sm:w-auto sm:px-4 rounded-xl bg-primary text-on-primary flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 shrink-0">
              <Plus size={20} />
              <span className="hidden sm:inline font-label-md font-bold">New Vendor</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-surface border-outline-variant/30 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-on-surface">Register New Vendor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 mt-4">
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Company Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 bg-surface-container rounded-lg px-3 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Com. License *</label>
                    <input required value={formData.commercialLicense} onChange={e => setFormData({...formData, commercialLicense: e.target.value})} className="h-10 bg-surface-container rounded-lg px-3 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Category *</label>
                    <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="h-10 bg-surface-container rounded-lg px-3 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status *</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="h-10 bg-surface-container rounded-lg px-3 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="min-h-[80px] py-2 bg-surface-container rounded-lg px-3 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y" />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <button type="submit" disabled={createVendor.isPending} className="w-full sm:w-auto h-10 px-4 bg-primary text-on-primary rounded-lg font-bold text-sm shadow-md hover:bg-primary/90 disabled:opacity-50">
                  {createVendor.isPending ? "Saving..." : "Register Vendor"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search vendors by name, license, or category..."
            className="w-full h-12 pl-12 pr-4 bg-surface-container rounded-xl border border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface-container flex items-center gap-2 text-on-surface hover:bg-surface-container-high transition-colors" aria-label="Filter status">
                <Filter size={18} className="text-on-surface-variant" />
                <span className="text-sm font-medium hidden sm:inline">
                  {statusFilter === "all" ? "All Status" : statusFilter === "active" ? "Active" : "Inactive"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-surface-container border-outline-variant/30">
              <DropdownMenuLabel>Status Filter</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-outline-variant/10" />
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <DropdownMenuRadioItem value="all">All Status</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="inactive">Inactive</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface-container flex items-center gap-2 text-on-surface hover:bg-surface-container-high transition-colors" aria-label="Sort options">
                {order === "asc" ? <ArrowUp size={18} className="text-on-surface-variant" /> : <ArrowDown size={18} className="text-on-surface-variant" />}
                <span className="text-sm font-medium hidden sm:inline">
                  {sort === "name" ? "Name" : sort === "createdAt" ? "Created" : "Updated"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-surface-container border-outline-variant/30">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-outline-variant/10" />
              <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as any)}>
                <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="createdAt">Date Created</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="updatedAt">Date Updated</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator className="bg-outline-variant/10" />
              <DropdownMenuLabel>Order</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={order} onValueChange={(v) => setOrder(v as any)}>
                <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col gap-space-sm">
        {isLoading ? (
          <div className="flex justify-center p-8"><span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span></div>
        ) : !Array.isArray(vendors) || vendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30 text-on-surface-variant">
            <Store size={32} className="mb-2 opacity-50" />
            <p className="font-medium text-on-surface">No vendors found</p>
            <p className="text-sm mt-1 text-center">Try a different search or register a new vendor.</p>
          </div>
        ) : (
          vendors.map((v) => (
            <div key={v.id} className="flex flex-col bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm hover:border-outline-variant/30 transition-colors">
              <div 
                role="button"
                tabIndex={0}
                className="flex items-center justify-between p-space-md cursor-pointer text-left focus:outline-none focus:bg-surface-container/50"
                onClick={() => setSelectedVendorId(selectedVendorId === v.id ? null : v.id)}
                onKeyDown={(e: KeyboardEvent) => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedVendorId(selectedVendorId === v.id ? null : v.id); } }}
                aria-expanded={selectedVendorId === v.id}
                aria-controls={`vendor-details-${v.id}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/10">
                    <Building2 size={24} className="text-secondary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-on-surface font-bold truncate">{v.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${v.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        {v.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-on-surface-variant truncate">
                      <span className="bg-surface-container-high px-1.5 py-0.5 rounded font-medium">{v.category}</span>
                      <span>License #{v.commercialLicense}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant transition-colors" aria-label="More actions">
                        <MoreVertical size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-surface-container border-outline-variant/30">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(v); }} className="gap-2 cursor-pointer hover:bg-surface-container-high">
                        <Edit2 size={16} /> Edit Vendor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeletingId(v.id); }} className="gap-2 text-error cursor-pointer hover:bg-error/10 hover:text-error">
                        <Trash2 size={16} /> Archive Vendor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <ChevronRight size={20} className={`text-on-surface-variant transition-transform ${selectedVendorId === v.id ? 'rotate-90' : ''}`} aria-hidden="true" />
                </div>
              </div>
              
              {selectedVendorId === v.id && (
                <div id={`vendor-details-${v.id}`} className="px-space-md pb-space-md pt-0 animate-in fade-in slide-in-from-top-2 border-t border-outline-variant/10">
                  {v.notes && (
                    <div className="mt-4 p-3 bg-surface-container rounded-lg border border-outline-variant/10">
                      <h5 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Notes</h5>
                      <p className="text-sm text-on-surface whitespace-pre-wrap">{v.notes}</p>
                    </div>
                  )}
                  <VendorInsightView vendorId={v.id} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-surface border-outline-variant/30 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-on-surface">Edit Vendor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 mt-4">
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Company Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 bg-surface-container rounded-lg px-3 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Com. License *</label>
                    <input required value={formData.commercialLicense} onChange={e => setFormData({...formData, commercialLicense: e.target.value})} className="h-10 bg-surface-container rounded-lg px-3 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Category *</label>
                    <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="h-10 bg-surface-container rounded-lg px-3 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status *</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="h-10 bg-surface-container rounded-lg px-3 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="min-h-[80px] py-2 bg-surface-container rounded-lg px-3 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y" />
                </div>
              </div>
            <DialogFooter className="mt-4">
              <button type="submit" disabled={updateVendor.isPending} className="w-full sm:w-auto h-10 px-4 bg-primary text-on-primary rounded-lg font-bold text-sm shadow-md hover:bg-primary/90 disabled:opacity-50">
                {updateVendor.isPending ? "Saving..." : "Save Changes"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent className="sm:max-w-sm bg-surface border-outline-variant/30">
          <DialogHeader>
            <DialogTitle className="text-on-surface flex items-center gap-2">
              <AlertCircle size={20} className="text-error" /> Confirm Removal
            </DialogTitle>
          </DialogHeader>
          <p className="text-on-surface-variant text-sm mt-2">
            Are you sure you want to remove this vendor? This action cannot be undone. Previous comparisons using this vendor will still retain their snapshot data.
          </p>
          <DialogFooter className="mt-6 flex flex-row justify-end gap-3">
            <DialogClose asChild>
              <button className="h-10 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors">
                Cancel
              </button>
            </DialogClose>
            <button onClick={handleDelete} disabled={deleteVendor.isPending} className="h-10 px-4 rounded-lg bg-error hover:bg-error/90 text-on-error font-medium transition-colors disabled:opacity-50 shadow-sm shadow-error/20">
              {deleteVendor.isPending ? "Removing..." : "Remove Vendor"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
