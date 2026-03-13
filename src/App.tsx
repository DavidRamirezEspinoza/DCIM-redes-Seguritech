/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Server,
  Plus,
  ChevronLeft,
  Settings,
  Save,
  Upload,
  Trash2,
  Cpu,
  Network,
  Database,
  Info,
  X,
  GripVertical,
  AlertTriangle,
  Edit,
  Shield,
  Activity,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { supabase } from './supabaseClient';

// @ts-ignore
import logoSeguritech from './imagenes/1 Logo seguritech.png';

// --- Types ---

type DeviceType = 'Switch' | 'Router' | 'Patch Panel' | 'Server' | 'NVR' | 'Firewall' | 'Control' | 'UPS';

interface PortConfig {
  id: number;
  name?: string;
  connectedTo: string;
  vlan: string;
  cableColor: string;
  destinationPort: string;
  cableLabel?: string;
}

interface Device {
  id: string;
  name: string;
  type: DeviceType;
  uPosition: number; // Starting U position (1-indexed from bottom)
  uHeight: number;
  ports: PortConfig[];
}

interface Rack {
  id: string;
  name: string;
  units: number; // Total U (e.g., 42U)
  devices: Device[];
}

type NavigationLevel = 
  | { type: 'GLOBAL' }
  | { type: 'RACK'; rackId: string }
  | { type: 'DEVICE'; rackId: string; deviceId: string };

// --- Constants ---

const DEFAULT_RACK_UNITS = 42;
const STORAGE_KEY = 'seguritech_networks_config';

// --- Helper Components ---

const DeviceGraphic = ({ device, onClick, showU }: { device: Device; onClick?: () => void; showU?: boolean }) => {
  const baseClasses = "w-full h-full px-3 flex items-center justify-between border transition-all hover:brightness-110 cursor-pointer overflow-hidden relative group";
  
  const UBadge = showU ? (
    <div className="absolute top-0 left-0 bg-black/40 text-[8px] px-1 font-mono text-zinc-400 border-r border-b border-white/10 z-10">
      {device.uPosition}U
    </div>
  ) : null;

  const HeightBadge = device.uHeight > 1 ? (
    <div className="absolute bottom-0 left-0 bg-emerald-500/20 text-[8px] px-1 font-mono text-emerald-400 border-r border-t border-emerald-500/20 z-10">
      {device.uHeight}U
    </div>
  ) : null;

  if (device.type === 'Switch') {
    return (
      <div onClick={onClick} className={`${baseClasses} bg-blue-900/40 border-blue-700 text-blue-200`}>
        {UBadge}
        {HeightBadge}
        <div className="flex items-center gap-2 flex-1 min-w-0 ml-4">
          <Network size={12} className="flex-shrink-0 text-blue-400" />
          <span className="text-[10px] font-bold truncate uppercase tracking-tighter">{device.name}</span>
        </div>
        {/* Cambiamos a Grid de 24 columnas para que 48 puertos queden en 2 filas */}
        <div className="grid grid-rows-2 grid-flow-col gap-0.5 flex-shrink-0 mr-2">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="w-1 h-1 bg-zinc-800 rounded-sm border border-zinc-700 shadow-inner" />
          ))}
        </div>
      </div>
    );
  }

  if (device.type === 'Patch Panel') {
    return (
      <div onClick={onClick} className={`${baseClasses} bg-zinc-800 border-zinc-700 text-zinc-400`}>
        {UBadge}
        {HeightBadge}
        <div className="flex items-center gap-2 flex-1 min-w-0 ml-4">
          <Database size={12} className="flex-shrink-0 text-zinc-500" />
          <span className="text-[10px] font-bold truncate uppercase tracking-tighter">{device.name}</span>
        </div>
        {/* Ajustado a 24 columnas para mostrar 48 puertos en 2 filas de círculos */}
        <div className="grid grid-rows-2 grid-flow-col gap-0.5 flex-shrink-0 mr-2">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full border border-zinc-600 bg-black/20" />
          ))}
        </div>
      </div>
    );
  }

  if (device.type === 'Router') {
    return (
      <div onClick={onClick} className={`${baseClasses} bg-emerald-900/40 border-emerald-700 text-emerald-200`}>
        {UBadge}
        {HeightBadge}
        <div className="flex items-center gap-2 flex-1 min-w-0 ml-4">
          <Cpu size={12} className="flex-shrink-0 text-emerald-400" />
          <span className="text-[10px] font-bold truncate uppercase tracking-tighter">{device.name}</span>
        </div>
        <div className="flex gap-2 flex-shrink-0 items-center">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500/50 border border-emerald-400" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/50 border border-emerald-400" />
          </div>
        </div>
      </div>
    );
  }

  if (device.type === 'Server' || device.type === 'NVR') {
    return (
      <div onClick={onClick} className={`${baseClasses} bg-zinc-900 border-zinc-700 text-zinc-100`}>
        {UBadge}
        {HeightBadge}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
        <div className="flex flex-col items-center justify-center w-full gap-1 z-10">
          <span className="text-xs font-black uppercase tracking-widest">{device.name}</span>
          <span className="text-[8px] text-zinc-500 font-mono">{device.type} UNIT</span>
        </div>
      </div>
    );
  }

  if (device.type === 'Firewall') {
    return (
      <div onClick={onClick} className={`${baseClasses} bg-red-950/40 border-red-700 text-red-200`}>
        {UBadge}
        {HeightBadge}
        <div className="flex items-center gap-2 flex-1 min-w-0 ml-4">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold truncate uppercase tracking-tighter">{device.name}</span>
        </div>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-zinc-800 border border-zinc-700 rounded-sm" />
          <div className="w-3 h-3 bg-zinc-800 border border-zinc-700 rounded-sm" />
        </div>
      </div>
    );
  }

  if (device.type === 'Control') {
    return (
      <div onClick={onClick} className={`${baseClasses} bg-indigo-950/40 border-indigo-700 text-indigo-200`}>
        {UBadge}
        {HeightBadge}
        <div className="flex items-center gap-2 flex-1 min-w-0 ml-4">
          <Settings size={12} className="text-indigo-400" />
          <span className="text-[10px] font-bold truncate uppercase tracking-tighter">{device.name}</span>
        </div>
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-indigo-500/30 rounded-full" />
          <div className="w-1 h-3 bg-indigo-500/30 rounded-full" />
          <div className="w-1 h-3 bg-indigo-500/30 rounded-full" />
        </div>
      </div>
    );
  }

  if (device.type === 'UPS') {
    return (
      <div onClick={onClick} className={`${baseClasses} bg-zinc-950 border-zinc-800 text-zinc-500`}>
        {UBadge}
        {HeightBadge}
        <div className="flex flex-col items-center justify-center w-full z-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{device.name}</span>
          <div className="flex gap-1 mt-1">
            <div className="w-4 h-1 bg-emerald-500/50 rounded-full" />
            <div className="w-4 h-1 bg-zinc-800 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  title
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
  title?: string;
}) => {
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700',
    danger: 'bg-red-900/50 hover:bg-red-800/50 text-red-200 border-red-800',
    ghost: 'bg-transparent hover:bg-zinc-800 text-zinc-400 border-transparent',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-4 py-2 rounded-md border transition-all duration-200 flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-bottom border-zinc-800 bg-zinc-950/50">
          <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [nav, setNav] = useState<NavigationLevel>({ type: 'GLOBAL' });
  const [isAddRackModalOpen, setIsAddRackModalOpen] = useState(false);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [isEditDeviceModalOpen, setIsEditDeviceModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  // --- LÓGICA DE SUPABASE (NUEVO) ---
  
  // 1. Función para guardar los racks en la nube
  const saveToSupabase = async () => {
    try {
      const { error } = await supabase
        .from('devices')
        .upsert(
          racks.map(rack => ({
            id: rack.id,
            name: rack.name,
            type: 'RACK',
            ports: rack.devices, // Guardamos los dispositivos internos aquí
            updated_at: new Date()
          }))
        );

      if (error) throw error;
      alert("✅ ¡Sincronizado con Seguritech Cloud!");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("❌ Error al conectar con la base de datos.");
    }
  };

  // 2. Efecto para cargar los datos automáticamente al abrir la app
useEffect(() => {
  const loadData = async () => {

    const { data, error } = await supabase
      .from("devices")
      .select("*");

      console.log("DATOS DESDE SUPABASE:", data);

    if (error) {
      console.error(error);
      return;
    }

    const loadedRacks = [
      {
        id: "rack1",
        name: "Rack 1",
        units: 42,
        devices: data.map((device, index) => ({
          id: device.id,
          name: device.name,
          type: device.type,

          // 👇 protección si Supabase no trae position o height
          uPosition: Number(device.position) || (index + 1),
          uHeight: Number(device.height) || 1,

          ports: device.ports || []
        }))
      }
    ];

    setRacks(loadedRacks);

  };

  loadData();
}, []);


  // --- TUS FUNCIONES ORIGINALES ---

  const updateDevice = (rackId: string, deviceId: string, updates: Partial<Device>) => {
    setRacks(racks.map(r => {
      if (r.id !== rackId) return r;
      return {
        ...r,
        devices: r.devices.map(d => d.id === deviceId ? { ...d, ...updates } : d)
      };
    }));
    setIsEditDeviceModalOpen(false);
    setEditingDevice(null);
  };

  const [isPortModalOpen, setIsPortModalOpen] = useState(false);
  const [selectedPort, setSelectedPort] = useState<{ deviceId: string; portId: number } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    onConfirm: () => void;
    variant: 'danger' | 'primary'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'primary'
  });

  // --- PERSISTENCIA CON SUPABASE ---

  // 1. Cargar datos al iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from('devices')
          .select('*');
        
        if (error) throw error;

        if (data && data.length > 0) {
          // Transformamos los datos de la nube al formato de tus racks
          const loadedRacks = data.map(item => ({
            id: item.id,
            name: item.name,
            devices: item.ports || []
          }));
          setRacks(loadedRacks);
        } else {
          // Si la nube está vacía, intentamos cargar de localStorage como respaldo
          const saved = localStorage.getItem('seguritech_dcim_backup');
          if (saved) setRacks(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Error cargando desde Supabase:", e);
      }
    };
    loadData();
  }, []);

  // 2. Guardar configuración en la nube
const saveConfig = async () => {

  console.log("Guardando configuración...");

  try {

    const payload = racks.flatMap(rack =>
      rack.devices.map(device => ({
        id: device.id,
        name: device.name,
        type: device.type,
        rack: rack.name,
        position: device.uPosition,
        height: device.uHeight,
        ports: device.ports
      }))
    );

    const { error: deleteError } = await supabase
      .from("devices")
      .delete()
      .gt("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) throw deleteError;

    if (payload.length > 0) {

      const { error: insertError } = await supabase
        .from("devices")
        .insert(payload);

      if (insertError) throw insertError;

    }

    alert("Configuración guardada correctamente");

  } catch (err) {

    console.error(err);
    alert("Error al guardar");

  }

};

  // 3. Funciones de archivos (Exportar/Importar) - Se mantienen igual por utilidad
  const exportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(racks, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "seguritech_networks_config.json");
    downloadAnchorNode.click();
  };

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setRacks(json);
      } catch (err) {
        alert("Error al importar el archivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  // Navigation Handlers
  const goToGlobal = () => setNav({ type: 'GLOBAL' });
  const goToRack = (rackId: string) => setNav({ type: 'RACK', rackId });
  const goToDevice = (rackId: string, deviceId: string) => setNav({ type: 'DEVICE', rackId, deviceId });

  // Data Handlers
  const addRack = (name: string, units: number) => {
    const newRack: Rack = {
      id: crypto.randomUUID(),
      name,
      units,
      devices: []
    };
    setRacks([...racks, newRack]);
    setIsAddRackModalOpen(false);
  };

  const addDevice = (rackId: string, device: Omit<Device, 'id' | 'ports'>) => {
    const rack = racks.find(r => r.id === rackId);
    if (!rack) return;

    if (device.uPosition < 1 || (device.uPosition + device.uHeight - 1) > rack.units) {
      alert(`El dispositivo excede los límites del rack (1-${rack.units}U)`);
      return;
    }

    // Check for collisions across the entire height of the new device
    const newRange = Array.from({ length: device.uHeight }, (_, i) => device.uPosition + i);
    const collision = rack.devices.find(d => {
      const existingRange = Array.from({ length: d.uHeight }, (_, i) => d.uPosition + i);
      return newRange.some(u => existingRange.includes(u));
    });

    if (collision) {
      setConfirmModal({
        isOpen: true,
        title: 'Conflicto de Posición',
        message: `La posición seleccionada se solapa con "${collision.name}". ¿Deseas reemplazarlo?`,
        variant: 'danger',
        onConfirm: () => {
          const numPorts = (device.type === 'Switch' || device.type === 'Patch Panel') ? 48 : 4;
          const newDevice: Device = {
            ...device,
            id: crypto.randomUUID(),
            ports: Array.from({ length: numPorts }, (_, i) => {
              let portName = `${i + 1}`;
              if (device.type === 'Server' || device.type === 'Firewall') {
                const names = ['MGMT', 'WAN', 'LAN1', 'LAN2'];
                portName = names[i] || `P${i + 1}`;
              }
              return {
                id: i + 1,
                name: portName,
                connectedTo: '',
                vlan: '1',
                cableColor: '#3b82f6',
                destinationPort: ''
              };
            })
          };
          setRacks(racks.map(r => r.id === rackId ? { 
            ...r, 
            devices: [...r.devices.filter(d => d.id !== collision.id), newDevice] 
          } : r));
          setIsAddDeviceModalOpen(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
      return;
    }

    const numPorts = (device.type === 'Switch' || device.type === 'Patch Panel') ? 48 : 4;
    const newDevice: Device = {
      ...device,
      id: crypto.randomUUID(),
      ports: Array.from({ length: numPorts }, (_, i) => {
        let portName = `${i + 1}`;
        if (device.type === 'Server' || device.type === 'Firewall') {
          const names = ['MGMT', 'WAN', 'LAN1', 'LAN2'];
          portName = names[i] || `P${i + 1}`;
        }
        return {
          id: i + 1,
          name: portName,
          connectedTo: '',
          vlan: '1',
          cableColor: '#3b82f6',
          destinationPort: ''
        };
      })
    };
    setRacks(racks.map(r => r.id === rackId ? { ...r, devices: [...r.devices, newDevice] } : r));
    setIsAddDeviceModalOpen(false);
  };

  const updatePort = (rackId: string, deviceId: string, portId: number, config: Partial<PortConfig>) => {
    setRacks(racks.map(r => {
      if (r.id !== rackId) return r;
      return {
        ...r,
        devices: r.devices.map(d => {
          if (d.id !== deviceId) return d;
          return {
            ...d,
            ports: d.ports.map(p => p.id === portId ? { ...p, ...config } : p)
          };
        })
      };
    }));
    setIsPortModalOpen(false);
  };

  const deleteRack = (id: string) => {
    const rack = racks.find(r => r.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Rack',
      message: `¿Estás seguro de que deseas eliminar el rack "${rack?.name}"? Esta acción no se puede deshacer.`,
      variant: 'danger',
      onConfirm: () => {
        setRacks(racks.filter(r => r.id !== id));
        if (nav.type === 'RACK' && nav.rackId === id) goToGlobal();
        if (nav.type === 'DEVICE' && nav.rackId === id) goToGlobal();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const deleteDevice = (rackId: string, deviceId: string) => {
    const rack = racks.find(r => r.id === rackId);
    const device = rack?.devices.find(d => d.id === deviceId);
    
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Dispositivo',
      message: `¿Estás seguro de que deseas eliminar "${device?.name}"? Las conexiones existentes a este equipo se marcarán como huérfanas.`,
      variant: 'danger',
      onConfirm: () => {
        const deviceName = device?.name;
        setRacks(racks.map(r => {
          // Clean up connections in ALL racks
          return {
            ...r,
            devices: r.devices.filter(d => d.id !== deviceId).map(d => ({
              ...d,
              ports: d.ports.map(p => 
                p.connectedTo === deviceName 
                  ? { ...p, connectedTo: `[HUÉRFANO] (${deviceName})` } 
                  : p
              )
            }))
          };
        }));
        if (nav.type === 'DEVICE' && nav.deviceId === deviceId) goToRack(rackId);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const reorderDevices = (rackId: string, newDevices: Device[]) => {
    setRacks(racks.map(r => {
      if (r.id !== rackId) return r;
      
      // Recalculate U positions based on new order (1 is top)
      const updatedDevices = newDevices.map((d, index) => ({
        ...d,
        uPosition: index + 1
      }));

      return { ...r, devices: updatedDevices };
    }));
  };

  // --- Views ---

  const GlobalView = () => (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Database className="text-emerald-500" /> Centro de Datos
          </h2>
          <p className="text-zinc-500 text-sm">Vista general de la infraestructura</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsAddRackModalOpen(true)}>
            <Plus size={18} /> Nuevo Rack
          </Button>
          <Button variant="secondary" onClick={saveConfig}>
            <Save size={18} /> Guardar
          </Button>
          <Button variant="secondary" onClick={exportConfig}>
            <Upload size={18} className="rotate-180" /> Exportar
          </Button>
          <label className="cursor-pointer">
            <input type="file" className="hidden" onChange={importConfig} accept=".json" />
            <div className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 text-sm font-medium">
              <Upload size={18} /> Importar
            </div>
          </label>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {racks.length === 0 ? (
          <div className="w-full h-64 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-600 gap-4">
            <Server size={48} />
            <p>No hay racks configurados. Comienza agregando uno.</p>
          </div>
        ) : (
          racks.map(rack => (
            <motion.div 
              key={rack.id}
              layoutId={rack.id}
              className="flex-shrink-0 w-64 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-lg"
            >
              <div className="p-4 bg-zinc-950/50 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="font-bold text-zinc-200 truncate pr-2">{rack.name}</h3>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase tracking-wider">{rack.units}U</span>
              </div>
              
              <div className="flex-1 p-4 bg-zinc-900/50 relative min-h-[400px]">
                {/* Rack Rails */}
                <div className="absolute inset-y-0 left-2 w-1 bg-zinc-800 rounded-full" />
                <div className="absolute inset-y-0 right-2 w-1 bg-zinc-800 rounded-full" />
                
                {/* Devices Visualization */}
                <div className="relative h-full grid grid-cols-1 border border-zinc-800/50 rounded overflow-hidden bg-zinc-950/30" style={{ gridTemplateRows: `repeat(${rack.units}, minmax(0, 1fr))` }}>
                  {Array.from({ length: rack.units }).map((_, i) => {
                    const u = rack.units - i; // 42 at top, 1 at bottom
                    const device = rack.devices.find(d => u >= d.uPosition && u < d.uPosition + d.uHeight);
                    
                    if (device) {
                      if (u === device.uPosition + device.uHeight - 1) {
                        return (
                          <div 
                            key={u} 
                            style={{ gridRow: `span ${device.uHeight}` }}
                            className="relative"
                          >
                            <DeviceGraphic device={device} />
                          </div>
                        );
                      }
                      return null;
                    }

                    return (
                      <div key={u} className="border-b border-zinc-800/20 last:border-0 flex items-center justify-center opacity-5">
                        <div className="w-full h-[1px] bg-zinc-700" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-zinc-950/50 border-t border-zinc-800 flex gap-2">
                <Button variant="secondary" className="flex-1 py-1 px-2" onClick={() => goToRack(rack.id)}>
                  Gestionar
                </Button>
                <Button variant="danger" className="p-1 px-2" onClick={() => deleteRack(rack.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  const RackZoomView = ({ rackId }: { rackId: string }) => {
    const rack = racks.find(r => r.id === rackId);
    if (!rack) return null;

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={goToGlobal}>
              <ChevronLeft size={20} /> Volver
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">{rack.name}</h2>
              <p className="text-zinc-500 text-sm">Configuración de Rack - {rack.units} Unidades</p>
            </div>
          </div>
          <Button onClick={() => setIsAddDeviceModalOpen(true)}>
            <Plus size={18} /> Agregar Dispositivo
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rack Visualizer (Large) */}
          <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-8 flex justify-center shadow-2xl">
            <div className="w-full max-w-[300px] bg-zinc-900 border-4 border-zinc-800 rounded-lg relative p-1 shadow-inner">
              {/* Rack Numbers */}
              <div className="absolute -left-8 inset-y-0 flex flex-col justify-between py-1 text-[10px] text-zinc-600 font-mono">
                {Array.from({ length: rack.units }).map((_, i) => (
                  <span key={i} className="flex-1 flex items-center justify-end pr-2">{rack.units - i}</span>
                ))}
              </div>

              <div className="grid grid-cols-1 h-full min-h-[600px]" style={{ gridTemplateRows: `repeat(${rack.units}, minmax(0, 1fr))` }}>
                {Array.from({ length: rack.units }).map((_, i) => {
                  const u = rack.units - i;
                  const device = rack.devices.find(d => u >= d.uPosition && u < d.uPosition + d.uHeight);
                  
                  if (device) {
                    if (u === device.uPosition + device.uHeight - 1) {
                      return (
                        <div 
                          key={device.id} 
                          style={{ gridRow: `span ${device.uHeight}` }}
                          className="relative"
                        >
                          <DeviceGraphic device={device} onClick={() => goToDevice(rack.id, device.id)} showU />
                        </div>
                      );
                    }
                    return null;
                  }

                  return (
                    <div key={u} className="border-b border-zinc-800/50 last:border-0 flex items-center justify-center relative">
                      <div className="w-full h-[1px] bg-zinc-800/50" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Device List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-300 flex items-center gap-2">
                <Cpu size={18} className="text-emerald-500" /> Dispositivos Instalados
              </h3>
              <span className="text-[10px] text-zinc-500 uppercase bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Arrastra para reordenar</span>
            </div>
            
            {rack.devices.length === 0 ? (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-zinc-500 gap-2">
                <Info size={32} />
                <p>No hay dispositivos en este rack.</p>
              </div>
            ) : (
              <Reorder.Group 
                axis="y" 
                values={[...rack.devices].sort((a, b) => a.uPosition - b.uPosition)} 
                onReorder={(newOrder) => reorderDevices(rack.id, newOrder)}
                className="flex flex-col gap-3"
              >
                {[...rack.devices].sort((a, b) => a.uPosition - b.uPosition).map(device => (
                  <Reorder.Item 
                    key={device.id} 
                    value={device}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors group cursor-grab active:cursor-grabbing"
                  >
                    <div className="text-zinc-700 group-hover:text-zinc-500 transition-colors">
                      <GripVertical size={20} />
                    </div>
                    
                    <div className="flex-1 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-zinc-100">{device.name}</h4>
                        <span className="text-xs text-zinc-500">{device.type} • Posición {device.uPosition}U ({device.uHeight}U)</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500" 
                              style={{ width: `${(device.ports.filter(p => p.connectedTo).length / device.ports.length) * 100}%` }} 
                            />
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono w-8">
                            {device.ports.filter(p => p.connectedTo).length}/{device.ports.length}
                          </span>
                        </div>

                        <div className="flex gap-1">
                          <Button variant="ghost" className="p-1.5" onClick={() => {
                            setEditingDevice(device);
                            setIsEditDeviceModalOpen(true);
                          }} title="Editar posición/datos">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" className="p-1.5" onClick={() => goToDevice(rack.id, device.id)} title="Gestionar puertos">
                            <Settings size={16} />
                          </Button>
                          <Button variant="danger" className="p-1.5" onClick={() => deleteDevice(rack.id, device.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DeviceDetailView = ({ rackId, deviceId }: { rackId: string; deviceId: string }) => {
    const rack = racks.find(r => r.id === rackId);
    const device = rack?.devices.find(d => d.id === deviceId);
    if (!device || !rack) return null;

    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => goToRack(rackId)}>
              <ChevronLeft size={20} /> Volver al Rack
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">{device.name}</h2>
              <p className="text-zinc-500 text-sm">{device.type} en {rack.name} (Posición {device.uPosition}U)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-zinc-800 rounded border border-zinc-700 text-xs text-zinc-400 flex items-center gap-2">
              <Network size={14} /> {device.ports.filter(p => p.connectedTo).length} Puertos Activos
            </div>
          </div>
        </div>

        {/* Device Front Panel Drawing */}
        <div className="bg-zinc-950 border-4 border-zinc-800 rounded-lg p-10 shadow-2xl relative overflow-hidden">
          {/* Bezel details */}
          <div className="absolute top-4 left-4 flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
          </div>
          <div className="absolute top-4 right-4 text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
            SEGURITECH INDUSTRIAL v2.0
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded p-6 flex flex-col gap-8">
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-950 rounded border border-zinc-800 flex items-center justify-center">
                  <Cpu size={24} className="text-zinc-700" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">System Status</div>
                  <div className="text-sm font-mono text-emerald-500">OPERATIONAL</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Model</div>
                <div className="text-sm font-mono text-zinc-300">{device.type.toUpperCase()}-X{device.ports.length}</div>
              </div>
            </div>

         {/* Ports Grid - Versión Limpia y Sin Errores */}
        <div 
          className={`${(device.type === 'Switch' || device.type === 'Patch Panel') ? 'grid' : 'flex flex-wrap'} gap-1 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 overflow-visible z-10`}
          style={(device.type === 'Switch' || device.type === 'Patch Panel') ? { 
            display: 'grid', 
            gridTemplateRows: 'repeat(2, minmax(0, 1fr))', 
            gridAutoFlow: 'column',
            gap: '4px 6px'
          } : {}}
        >
          {device.ports.map(port => (
            <div key={port.id} className="flex flex-col items-center gap-0.5 relative">
              <span className="text-[8px] font-mono text-zinc-600 truncate w-7 text-center">
                {port.name || port.id}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setSelectedPort({ deviceId: device.id, portId: port.id });
                  setIsPortModalOpen(true);
                }}
                className={`w-7 h-7 rounded-sm border flex items-center justify-center transition-all relative group
                  ${port.connectedTo ? 'border-zinc-400 bg-zinc-800 shadow-[0_0_5px_rgba(255,255,255,0.1)]' : 'border-zinc-800 bg-zinc-950'}
                  hover:z-30`}
              >
                {/* Port Interior */}
                <div className="w-4 h-2.5 bg-zinc-900 border border-zinc-800 rounded-[1px] flex items-center justify-center overflow-hidden">
                  {port.connectedTo && (
                    <div 
                      className="w-full h-full opacity-60" 
                      style={{ backgroundColor: port.cableColor }} 
                    />
                  )}
                </div>
                
                {/* Tooltip con Fondo Negro Sólido para que no se trasluzca nada */}
                {port.connectedTo && (
                  <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50 w-40 bg-black border border-zinc-700 p-3 rounded-md text-[10px] text-zinc-300 shadow-[0_20px_50px_rgba(0,0,0,0.7)] pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-md"></div>
                    
                    <div className="font-bold text-emerald-400 mb-1.5 pb-1.5 border-b border-zinc-800 flex justify-between">
                      <span>Puerto {port.name || port.id}</span>
                      <span className="text-[8px] text-zinc-600 uppercase font-mono">{port.id}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Dest:</span>
                        <span className="text-zinc-100 font-medium truncate ml-2">{port.connectedTo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Etiqueta:</span>
                        <span className="text-zinc-100 truncate ml-2">{port.cableLabel || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-zinc-800/50 mt-1">
                        <span className="text-zinc-500">VLAN:</span>
                        <span className="text-emerald-500 font-bold text-xs bg-emerald-950/50 px-2 py-0.5 rounded">{port.vlan}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.button>
            </div>
          ))}
        </div>
          </div>
        </div>

        {/* Port Legend/Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h4 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">Resumen de Conectividad</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Puertos Totales</span>
                <span className="text-zinc-200 font-mono">{device.ports.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Puertos Ocupados</span>
                <span className="text-emerald-500 font-mono">{device.ports.filter(p => p.connectedTo).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Puertos Libres</span>
                <span className="text-zinc-400 font-mono">{device.ports.length - device.ports.filter(p => p.connectedTo).length}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:col-span-2">
            <h4 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">Mapeo de VLANs</h4>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(device.ports.filter(p => p.connectedTo).map(p => p.vlan))).map(vlan => (
                <div key={vlan} className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-300">
                  VLAN {vlan}: {device.ports.filter(p => p.vlan === vlan && p.connectedTo).length} dispositivos
                </div>
              ))}
              {device.ports.filter(p => p.connectedTo).length === 0 && (
                <p className="text-zinc-600 text-xs italic">No hay datos de VLAN disponibles.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Modals ---

  const AddRackModal = () => {
    const [name, setName] = useState('');
    const [units, setUnits] = useState(DEFAULT_RACK_UNITS);

    return (
      <Modal isOpen={isAddRackModalOpen} onClose={() => setIsAddRackModalOpen(false)} title="Agregar Nuevo Rack">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Nombre del Rack</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="Ej: RACK-A1"
              className="bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Unidades (U)</label>
            <input 
              type="number" 
              value={units} 
              onChange={e => setUnits(parseInt(e.target.value))}
              className="bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <Button className="mt-4 justify-center" onClick={() => addRack(name || 'Nuevo Rack', units)} disabled={!name}>
            Crear Rack
          </Button>
        </div>
      </Modal>
    );
  };

  const EditDeviceModal = () => {
    const [name, setName] = useState(editingDevice?.name || '');
    const [type, setType] = useState<DeviceType>(editingDevice?.type || 'Switch');
    const [uPos, setUPos] = useState(editingDevice?.uPosition || 1);
    const [uHeight, setUHeight] = useState(editingDevice?.uHeight || 1);

    useEffect(() => {
      if (editingDevice) {
        setName(editingDevice.name);
        setType(editingDevice.type);
        setUPos(editingDevice.uPosition);
        setUHeight(editingDevice.uHeight);
      }
    }, [editingDevice]);

    if (nav.type !== 'RACK' || !editingDevice) return null;
    const rack = racks.find(r => r.id === nav.rackId);
    if (!rack) return null;

    return (
      <Modal isOpen={isEditDeviceModalOpen} onClose={() => setIsEditDeviceModalOpen(false)} title="Editar Dispositivo">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Nombre</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Tipo</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value as DeviceType)}
              className="bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="Switch">Switch (1U)</option>
              <option value="Router">Router (1U)</option>
              <option value="Patch Panel">Patch Panel (1U)</option>
              <option value="Server">Server (Multi-U)</option>
              <option value="NVR">NVR (Multi-U)</option>
              <option value="Firewall">Firewall (1U)</option>
              <option value="Control">Control (1U)</option>
              <option value="UPS">UPS (Multi-U)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Posición Base (U)</label>
              <input 
                type="number" 
                value={uPos} 
                min={1}
                max={rack.units}
                onChange={e => setUPos(parseInt(e.target.value))}
                className="bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Altura (U)</label>
              <input 
                type="number" 
                value={uHeight} 
                min={1}
                max={10}
                onChange={e => setUHeight(parseInt(e.target.value))}
                className="bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          <Button className="mt-4 justify-center" onClick={() => updateDevice(rack.id, editingDevice.id, { name, type, uPosition: uPos, uHeight })}>
            Guardar Cambios
          </Button>
        </div>
      </Modal>
    );
  };

  const AddDeviceModal = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState<DeviceType>('Switch');
    const [uPos, setUPos] = useState(1);
    const [uHeight, setUHeight] = useState(1);

    if (nav.type !== 'RACK') return null;
    const rack = racks.find(r => r.id === nav.rackId);
    if (!rack) return null;

    return (
      <Modal isOpen={isAddDeviceModalOpen} onClose={() => setIsAddDeviceModalOpen(false)} title="Agregar Dispositivo">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Nombre</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="Ej: SW-CORE-01"
              className="bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Tipo</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value as DeviceType)}
              className="bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="Switch">Switch (1U)</option>
              <option value="Router">Router (1U)</option>
              <option value="Patch Panel">Patch Panel (1U)</option>
              <option value="Server">Server (Multi-U)</option>
              <option value="NVR">NVR (Multi-U)</option>
              <option value="Firewall">Firewall (1U)</option>
              <option value="Control">Control (1U)</option>
              <option value="UPS">UPS (Multi-U)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Posición Base (U)</label>
              <input 
                type="number" 
                value={uPos} 
                min={1}
                max={rack.units}
                onChange={e => setUPos(parseInt(e.target.value))}
                className="bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Altura (U)</label>
              <input 
                type="number" 
                value={uHeight} 
                min={1}
                max={10}
                onChange={e => setUHeight(parseInt(e.target.value))}
                className="bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          <Button className="mt-4 justify-center" onClick={() => addDevice(rack.id, { name: name || 'Dispositivo', type, uPosition: uPos, uHeight })} disabled={!name}>
            Agregar al Rack
          </Button>
        </div>
      </Modal>
    );
  };

  const PortConfigModal = () => {
    if (!selectedPort || nav.type !== 'DEVICE') return null;
    const rack = racks.find(r => r.id === nav.rackId);
    const device = rack?.devices.find(d => d.id === selectedPort.deviceId);
    const port = device?.ports.find(p => p.id === selectedPort.portId);

    if (!port || !device || !rack) return null;

    const [connectedTo, setConnectedTo] = useState(port.connectedTo);
    const [vlan, setVlan] = useState(port.vlan);
    const [cableColor, setCableColor] = useState(port.cableColor);
    const [destPort, setDestPort] = useState(port.destinationPort);
    const [cableLabel, setCableLabel] = useState(port.cableLabel || '');

    return (
      <Modal isOpen={isPortModalOpen} onClose={() => setIsPortModalOpen(false)} title={`Configurar Puerto ${port.name || port.id}`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Dispositivo Destino</label>
            <input 
              type="text" 
              value={connectedTo} 
              onChange={e => setConnectedTo(e.target.value)}
              placeholder="Ej: PC-OFICINA-01"
              className="bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Etiqueta de Cable</label>
            <input 
              type="text" 
              value={cableLabel} 
              onChange={e => setCableLabel(e.target.value)}
              placeholder="Ej: CB-001-A"
              className="bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">VLAN</label>
              <input 
                type="text" 
                value={vlan} 
                onChange={e => setVlan(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Color de Cable</label>
              <input 
                type="color" 
                value={cableColor} 
                onChange={e => setCableColor(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-md h-10 w-full p-1 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-500 uppercase">Puerto de Destino (Mapeo)</label>
            <input 
              type="text" 
              value={destPort} 
              onChange={e => setDestPort(e.target.value)}
              placeholder="Ej: Patch Panel 1 - Puerto 12"
              className="bg-zinc-950 border border-zinc-800 rounded-md p-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="flex-1 justify-center" onClick={() => updatePort(rack.id, device.id, port.id, { connectedTo, vlan, cableColor, destinationPort: destPort, cableLabel })}>
              Guardar Cambios
            </Button>
            <Button variant="danger" onClick={() => updatePort(rack.id, device.id, port.id, { connectedTo: '', vlan: '1', cableColor: '#3b82f6', destinationPort: '', cableLabel: '' })}>
              Limpiar
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Contenedor de la imagen ajustado */}
          <div className="flex items-center justify-center h-10 overflow-hidden">
            <img 
              src={logoSeguritech} 
              alt="Logo" 
              className="h-full w-auto object-contain" 
            />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white">
            NETWORK <span className="text-emerald-500">MANGER</span>
          </h1>
        </div>
        <div className="flex items-center gap-6 text-xs font-medium text-zinc-500">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 
            SISTEMA ONLINE
          </span>
          <span className="hidden sm:inline">DCIM v1.0.0</span>
        </div>
      </div>
    </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={nav.type + (nav.type !== 'GLOBAL' ? (nav as any).rackId : '') + (nav.type === 'DEVICE' ? (nav as any).deviceId : '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {nav.type === 'GLOBAL' && <GlobalView />}
            {nav.type === 'RACK' && <RackZoomView rackId={nav.rackId} />}
            {nav.type === 'DEVICE' && <DeviceDetailView rackId={nav.rackId} deviceId={nav.deviceId} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 py-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs">© 2026 Network Manager-Soluciones-Tecnológicas. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">Soporte Técnico</a>
            <a href="#" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">Documentación</a>
            <a href="#" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">Privacidad</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddRackModal />
      <AddDeviceModal />
      <EditDeviceModal />
      <PortConfigModal />

      {/* Confirmation Modal */}
      <Modal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
        title={confirmModal.title}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4 p-4 bg-red-900/10 border border-red-900/20 rounded-lg">
            <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
            <p className="text-sm text-zinc-300 leading-relaxed">{confirmModal.message}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant={confirmModal.variant} 
              className="flex-1 justify-center" 
              onClick={confirmModal.onConfirm}
            >
              Confirmar
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1 justify-center" 
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
