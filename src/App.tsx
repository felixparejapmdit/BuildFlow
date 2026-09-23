import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Estate, 
  Location, 
  Zone, 
  Employee, 
  Project, 
  ManpowerAllocation,
  ProjectNote,
  Proposal,
  ChecklistSubmission,
  TradeSpecialtyItem,
  CategoryItem,
  PriorityItem,
  QualityGateItem,
  ProjectStatus,
  User,
  Snapshot
} from './types';
import { storage } from './services/storage';
import { Navbar, NavTabType } from './components/Navbar';
import { ProjectList } from './components/DownloadQueue/ProjectList';
import { ManpowerBoardView } from './components/Manpower/ManpowerBoardView';
import { PropertiesView } from './components/Management/PropertiesView';
import { ZonesManagementView } from './components/Management/ZonesManagementView';
import { CategoriesManagementView } from './components/Management/CategoriesManagementView';
import { PrioritiesManagementView } from './components/Management/PrioritiesManagementView';
import { RosterView } from './components/Management/RosterView';
import { TradesManagementView } from './components/Management/TradesManagementView';
import { ProjectsManagementView } from './components/Management/ProjectsManagementView';
import { QualityGateManagementView } from './components/Management/QualityGateManagementView';
import { UsersManagementView } from './components/Management/UsersManagementView';
import { SnapshotsView } from './components/Management/SnapshotsView';
import { ReassignmentDrawer } from './components/Manpower/ReassignmentDrawer';
import { PreFlightChecklistModal } from './components/Checklists/PreFlightChecklistModal';
import { ProposalOptionsModal } from './components/Proposals/ProposalOptionsModal';
import { StaleRadarModal } from './components/Alerts/StaleRadarModal';
import { ExecutiveDailyDigestModal } from './components/Reports/ExecutiveDailyDigestModal';
import { VaultSecurityModal } from './components/Alerts/VaultSecurityModal';
import { ProjectInspectorDrawer } from './components/ProjectDetails/ProjectInspectorDrawer';
import { AdminLoginView } from './components/Auth/AdminLoginView';
import { LogoutConfirmModal } from './components/Auth/LogoutConfirmModal';
import { ConfirmDialogContainer, showAlert } from './components/Common/ConfirmDialog';
import { PwaInstallPrompt } from './components/Common/PwaInstallPrompt';
import { isProjectStale } from './utils/time';

export const App: React.FC = () => {
  // URL-Driven Tab Routing: reads ?tab=xxx so F5 retains the active view
  const getInitialTab = (): NavTabType => {
    const param = new URLSearchParams(window.location.search).get('tab');
    const validTabs: NavTabType[] = [
      'projects', 'projects_table', 'manpower', 'properties', 'zones',
      'categories', 'priorities', 'roster', 'trades', 'quality_gates', 'users', 'snapshots'
    ];
    return validTabs.includes(param as NavTabType) ? (param as NavTabType) : 'projects';
  };
  const [activeTab, setActiveTab] = useState<NavTabType>(getInitialTab);

  const handleTabChange = useCallback((tab: NavTabType) => {
    setActiveTab(tab);
    // Push the new ?tab= param to the URL for F5 persistence
    const url = new URL(window.location.href);
    if (tab === 'projects') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', tab);
    }
    window.history.pushState(null, '', url.toString());
  }, []);

  // Back/Forward browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const param = new URLSearchParams(window.location.search).get('tab');
      const validTabs: NavTabType[] = [
        'projects', 'projects_table', 'manpower', 'properties', 'zones',
        'categories', 'priorities', 'roster', 'trades', 'quality_gates', 'users', 'snapshots'
      ];
      if (param && validTabs.includes(param as NavTabType)) {
        setActiveTab(param as NavTabType);
      } else {
        setActiveTab('projects');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('buildflow_auth') === 'true';
  });
  const [adminUser, setAdminUser] = useState<string>(() => {
    return localStorage.getItem('buildflow_admin_user') || 'VIP Executive Supervisor';
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Theme Mode State (Obsidian VIP Dark vs Warm Notion Light)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('buildflow_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Default to Obsidian Dark mode
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('buildflow_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLoginSuccess = (user: string) => {
    setIsAuthenticated(true);
    setAdminUser(user);
    localStorage.setItem('buildflow_auth', 'true');
    localStorage.setItem('buildflow_admin_user', user);

    if (user === 'VIP Executive Supervisor') {
      // 1-Click Supervisor Demo Login: Load full sample dataset
      storage.loadSampleData();
    } else {
      // Regular User Login: Clear all data / wipe all records for a clean slate
      storage.clearAllData();
    }
    refreshData();
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('buildflow_auth');
    setIsLogoutModalOpen(false);
  };
  
  // Core Domain State
  const [estates, setEstates] = useState<Estate[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allocations, setAllocations] = useState<ManpowerAllocation[]>([]);
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [trades, setTrades] = useState<TradeSpecialtyItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [qualityGateItems, setQualityGateItems] = useState<QualityGateItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  // Interactive Drawers and Modals
  const [selectedDrawerProject, setSelectedDrawerProject] = useState<Project | null>(null);
  const [selectedInspectorProject, setSelectedInspectorProject] = useState<Project | null>(null);
  const [selectedChecklistProject, setSelectedChecklistProject] = useState<Project | null>(null);
  const [selectedProposalProject, setSelectedProposalProject] = useState<Project | null>(null);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);
  const [isStaleRadarOpen, setIsStaleRadarOpen] = useState(false);
  const [isVaultSecurityOpen, setIsVaultSecurityOpen] = useState(false);

  // Hidden File Input for Database Tools
  const [importMode, setImportMode] = useState<'restore' | 'merge'>('restore');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Initial Data from Storage
  const refreshData = useCallback(() => {
    try {
      setEstates(storage.getEstates());
      setLocations(storage.getLocations());
      setZones(storage.getZones());
      setEmployees(storage.getEmployees());
      setProjects(storage.getProjects());
      setAllocations(storage.getAllocations());
      setNotes(storage.getNotes());
      setProposals(storage.getProposals());
      setTrades(storage.getTrades());
      setCategories(storage.getCategories());
      setPriorities(storage.getPriorities());
      setQualityGateItems(storage.getQualityGateItems());
      setUsers(storage.getUsers());
      setSnapshots(storage.getSnapshots());
    } catch (err) {
      console.warn('Storage refresh error, executing self-healing recovery:', err);
      try {
        storage.loadSampleData();
        setEstates(storage.getEstates());
        setLocations(storage.getLocations());
        setZones(storage.getZones());
        setEmployees(storage.getEmployees());
        setProjects(storage.getProjects());
        setAllocations(storage.getAllocations());
        setNotes(storage.getNotes());
        setProposals(storage.getProposals());
        setTrades(storage.getTrades());
        setCategories(storage.getCategories());
        setPriorities(storage.getPriorities());
        setQualityGateItems(storage.getQualityGateItems());
        setUsers(storage.getUsers());
        setSnapshots(storage.getSnapshots());
      } catch (innerErr) {
        console.error('Fatal storage recovery error:', innerErr);
      }
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Telemetry Stats Calculation
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;

    // Stale count includes stale projects + stale proposals (>48h)
    const staleProjectCount = projects.filter(p => isProjectStale(p.lastProgressUpdatedAt, p.status)).length;
    const staleProposalCount = proposals.filter(p => {
      if (p.status !== 'submitted' || !p.submittedToVipAt) return false;
      const hours = (Date.now() - new Date(p.submittedToVipAt).getTime()) / (1000 * 3600);
      return hours > 48;
    }).length;

    const deployableEmployees = employees.filter(e => e.isDeployable && e.isActive);
    const deployableIds = new Set(deployableEmployees.map(e => e.id));
    
    const assignedIds = new Set(
      allocations
        .filter(a => deployableIds.has(a.employeeId))
        .map(a => a.employeeId)
    );

    return {
      totalProjects,
      activeProjects,
      staleCount: staleProjectCount + staleProposalCount,
      deployedCount: assignedIds.size,
      deployableCount: deployableEmployees.length,
      totalStaff: employees.length
    };
  }, [projects, employees, allocations, proposals]);

  // Progress update handler (optimistic)
  const handleUpdateProgress = (projectId: string, newProgress: number, newStage?: string) => {
    const updated = storage.updateProjectProgress(projectId, newProgress, newStage);
    if (updated) {
      setProjects(prev => prev.map(p => p.id === projectId ? {
        ...p,
        progressPercentage: updated.progressPercentage,
        currentStageSummary: updated.currentStageSummary,
        lastProgressUpdatedAt: updated.lastProgressUpdatedAt,
        status: updated.status
      } : p));

      if (selectedDrawerProject?.id === projectId) {
        setSelectedDrawerProject(prev => prev ? {
          ...prev,
          progressPercentage: updated.progressPercentage,
          currentStageSummary: updated.currentStageSummary,
          status: updated.status
        } : null);
      }

      if (selectedInspectorProject?.id === projectId) {
        setSelectedInspectorProject(prev => prev ? {
          ...prev,
          progressPercentage: updated.progressPercentage,
          currentStageSummary: updated.currentStageSummary,
          status: updated.status
        } : null);
      }
    }
  };

  // Direct project status changer (Active, Paused, Awaiting Feedback, Completed)
  const handleUpdateStatus = (projectId: string, newStatus: ProjectStatus) => {
    const updated = storage.updateProjectStatus(projectId, newStatus);
    if (updated) {
      setProjects(prev => prev.map(p => p.id === projectId ? {
        ...p,
        status: updated.status,
        progressPercentage: updated.progressPercentage,
        currentStageSummary: updated.currentStageSummary,
        lastProgressUpdatedAt: updated.lastProgressUpdatedAt
      } : p));

      if (selectedDrawerProject?.id === projectId) {
        setSelectedDrawerProject(prev => prev ? {
          ...prev,
          status: updated.status,
          progressPercentage: updated.progressPercentage,
          currentStageSummary: updated.currentStageSummary,
          lastProgressUpdatedAt: updated.lastProgressUpdatedAt
        } : null);
      }

      if (selectedInspectorProject?.id === projectId) {
        setSelectedInspectorProject(prev => prev ? {
          ...prev,
          status: updated.status,
          progressPercentage: updated.progressPercentage,
          currentStageSummary: updated.currentStageSummary,
          lastProgressUpdatedAt: updated.lastProgressUpdatedAt
        } : null);
      }
    }
  };

  // Crew allocation handlers
  const handleAssign = (employeeId: string, projectId: string) => {
    storage.assignEmployeeToProject(employeeId, projectId);
    const updatedAllocs = storage.getAllocations();
    setAllocations(updatedAllocs);
    
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          assignedCrewCount: updatedAllocs.filter(a => a.projectId === p.id).length
        };
      }
      return p;
    }));
  };

  const handleUnassign = (employeeId: string, projectId: string) => {
    storage.removeEmployeeFromProject(employeeId, projectId);
    const updatedAllocs = storage.getAllocations();
    setAllocations(updatedAllocs);

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          assignedCrewCount: updatedAllocs.filter(a => a.projectId === p.id).length
        };
      }
      return p;
    }));
  };

  const handleBulkAdd = (employeeIds: string[], projectId: string) => {
    storage.bulkReassign(employeeIds, projectId);
    const updatedAllocs = storage.getAllocations();
    setAllocations(updatedAllocs);

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          assignedCrewCount: updatedAllocs.filter(a => a.projectId === p.id).length
        };
      }
      return p;
    }));
  };

  // Notes handler
  const handleAddNote = (projectId: string, noteType: ProjectNote['noteType'], author: string, content: string) => {
    const newNote = storage.addNote(projectId, noteType, author, content);
    setNotes(prev => [newNote, ...prev]);
  };

  // Proposal handler
  const handleSaveProposal = (proposal: Proposal) => {
    const saved = storage.saveProposal(proposal);
    setProposals(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setSelectedProposalProject(null);
  };

  // Quality Gate Checklist certification
  const handlePassChecklist = (submission: ChecklistSubmission) => {
    storage.saveChecklist(submission);
    
    storage.addNote(
      submission.projectId,
      'site_feedback',
      submission.checkedByName,
      'Pre-Flight Quality Gate Certified: All 7 requirements (Stock, Manpower, Timeline, 2+ Options, Pegs, Samples, Pros/Cons) verified and passed for VIP delivery.'
    );

    handleUpdateProgress(
      submission.projectId, 
      submission.checklistType === 'proposal_submission' ? 50 : 85, 
      'Pre-flight quality gate certified; submitted to VIP client'
    );

    const prop = proposals.find(p => p.projectId === submission.projectId);
    if (prop) {
      const updatedProp: Proposal = {
        ...prop,
        status: 'submitted',
        submittedToVipAt: new Date().toISOString()
      };
      storage.saveProposal(updatedProp);
      setProposals(prev => prev.map(p => p.id === updatedProp.id ? updatedProp : p));
    }

    setNotes(storage.getNotes());
    setSelectedChecklistProject(null);
  };

  // Roster Deployability Toggle
  const handleToggleDeployable = (employeeId: string) => {
    const updated = storage.toggleEmployeeDeployable(employeeId);
    if (updated) {
      setEmployees(prev => prev.map(e => e.id === employeeId ? updated : e));
    }
  };

  const handleSaveEmployee = (newEmployee: Employee) => {
    const saved = storage.saveEmployee(newEmployee);
    setEmployees(prev => {
      const idx = prev.findIndex(e => e.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteEmployee = (employeeId: string) => {
    storage.deleteEmployee(employeeId);
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
    setAllocations(storage.getAllocations());
    setProjects(storage.getProjects());
  };

  const handleBulkAddEmployees = (newEmployees: Employee[]) => {
    const updated = storage.bulkAddEmployees(newEmployees);
    setEmployees(updated);
  };

  // Taxonomy Handlers
  const handleSaveEstate = (newEstate: Estate) => {
    const saved = storage.saveEstate(newEstate);
    setEstates(prev => {
      const idx = prev.findIndex(e => e.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteEstate = (estateId: string) => {
    storage.deleteEstate(estateId);
    setEstates(prev => prev.filter(e => e.id !== estateId));
  };

  const handleSaveLocation = (newLocation: Location) => {
    const saved = storage.saveLocation(newLocation);
    setLocations(prev => {
      const idx = prev.findIndex(l => l.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteLocation = (locationId: string) => {
    storage.deleteLocation(locationId);
    setLocations(prev => prev.filter(l => l.id !== locationId));
  };

  const handleSaveZone = (newZone: Zone) => {
    const saved = storage.saveZone(newZone);
    setZones(prev => {
      const idx = prev.findIndex(z => z.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteZone = (zoneId: string) => {
    storage.deleteZone(zoneId);
    setZones(prev => prev.filter(z => z.id !== zoneId));
  };

  // Category Handlers
  const handleSaveCategory = (newCat: CategoryItem) => {
    const saved = storage.saveCategory(newCat);
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    storage.deleteCategory(categoryId);
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  // Priority Handlers
  const handleSavePriority = (newPrio: PriorityItem) => {
    const saved = storage.savePriority(newPrio);
    setPriorities(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const handleDeletePriority = (priorityId: string) => {
    storage.deletePriority(priorityId);
    setPriorities(prev => prev.filter(p => p.id !== priorityId));
  };

  // Trade Specialty Handlers
  const handleSaveTrade = (newTrade: TradeSpecialtyItem) => {
    const saved = storage.saveTrade(newTrade);
    setTrades(prev => {
      const idx = prev.findIndex(t => t.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteTrade = (tradeId: string) => {
    storage.deleteTrade(tradeId);
    setTrades(prev => prev.filter(t => t.id !== tradeId));
  };

  // Quality Gate Checklist Handlers
  const handleSaveQualityGateItem = (newItem: QualityGateItem) => {
    const saved = storage.saveQualityGateItem(newItem);
    setQualityGateItems(prev => {
      const idx = prev.findIndex(q => q.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteQualityGateItem = (itemId: string) => {
    storage.deleteQualityGateItem(itemId);
    setQualityGateItems(prev => prev.filter(q => q.id !== itemId));
  };

  // Project Creation & Update
  const handleCreateProject = (projectData: Partial<Project>) => {
    const newProj: Project = {
      id: `proj-${Date.now().toString(36)}`,
      zoneId: projectData.zoneId || zones[0]?.id || '',
      title: projectData.title || 'Untitled Project',
      category: projectData.category || 'renovation',
      status: projectData.status || 'active',
      progressPercentage: projectData.progressPercentage || 0,
      currentStageSummary: projectData.currentStageSummary || 'Initial setup and staging',
      priority: projectData.priority || 'normal',
      lastProgressUpdatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      assignedCrewCount: 0
    };

    const saved = storage.saveProject(newProj);
    setProjects(prev => [saved, ...prev]);
  };

  const handleSaveProject = (updatedProj: Project) => {
    const saved = storage.saveProject(updatedProj);
    setProjects(prev => prev.map(p => p.id === saved.id ? saved : p));
  };

  const handleDeleteProject = (projectId: string) => {
    storage.deleteProject(projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setAllocations(storage.getAllocations());
  };

  // Database Tools Operations
  const handleBackupDb = () => {
    const json = storage.exportDatabaseBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buildflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEncryptedBackup = () => {
    const agwcz = storage.exportEncryptedBackup();
    const blob = new Blob([agwcz], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buildflow_vault_${new Date().toISOString().split('T')[0]}.agwcz`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreDb = () => {
    setImportMode('restore');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleMergeImport = () => {
    setImportMode('merge');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      if (importMode === 'restore') {
        const res = storage.restoreDatabase(text);
        if (res.success) {
          refreshData();
          showAlert({
            title: 'Database Restored',
            message: 'All local databases, project schedules, and crew allocations were successfully restored from your backup file.',
            variant: 'success',
            notice: 'Current session refreshed with restored data'
          });
        } else {
          showAlert({
            title: 'Restore Failed',
            message: res.message,
            variant: 'danger'
          });
        }
      } else {
        const res = storage.mergeImport(text);
        if (res.success) {
          refreshData();
          showAlert({
            title: 'Merge Import Completed',
            message: res.message,
            variant: 'success'
          });
        } else {
          showAlert({
            title: 'Merge Import Failed',
            message: res.message,
            variant: 'danger'
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSaveDailySnapshot = () => {
    const { snapshotId, date } = storage.saveDailySnapshot();
    setSnapshots(storage.getSnapshots());
    showAlert({
      title: 'Daily Snapshot Recorded',
      message: `Point-in-time snapshot safely captured for ${date}.\n\nSnapshot Reference: ${snapshotId}`,
      variant: 'success',
      notice: 'Stored locally with full point-in-time rollback capability'
    });
  };

  // User Account Handlers
  const handleSaveUser = (user: User) => {
    const saved = storage.saveUser(user);
    setUsers(prev => {
      const idx = prev.findIndex(u => u.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteUser = (userId: string) => {
    storage.deleteUser(userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Snapshot Handlers
  const handleCreateSnapshot = (label: string, notes?: string) => {
    const snap = storage.createSnapshot(label, notes);
    setSnapshots(prev => [snap, ...prev]);
  };

  const handleRestoreSnapshot = (snapshotId: string) => {
    const result = storage.restoreFromSnapshot(snapshotId);
    if (result.success) {
      refreshData();
      showAlert({
        title: 'Snapshot Restored',
        message: 'Database was successfully rolled back to the selected point-in-time snapshot.',
        variant: 'success',
        notice: 'Operational state synchronized with snapshot'
      });
    } else {
      showAlert({
        title: 'Restore Failed',
        message: result.message,
        variant: 'danger'
      });
    }
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    storage.deleteSnapshot(snapshotId);
    setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
  };

  // Helper lookups for Inspector Drawer
  const inspectorZone = selectedInspectorProject ? zones.find(z => z.id === selectedInspectorProject.zoneId) : undefined;
  const inspectorLocation = inspectorZone ? locations.find(l => l.id === inspectorZone.locationId) : undefined;
  const inspectorEstate = inspectorLocation ? estates.find(e => e.id === inspectorLocation.estateId) : undefined;

  if (!isAuthenticated) {
    return <AdminLoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Hidden File Input for Database Import/Restore */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept=".json,.agwcz"
      />

      {/* Top Navigation & Telemetry */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewProjectClick={() => setIsCreateProjectModalOpen(true)}
        onOpenDailyReport={() => setIsDailyReportOpen(true)}
        onOpenStaleRadar={() => setIsStaleRadarOpen(true)}
        onOpenVaultSecurity={() => setIsVaultSecurityOpen(true)}
        onBackupDb={handleBackupDb}
        onEncryptedBackup={handleEncryptedBackup}
        onRestoreDb={handleRestoreDb}
        onMergeImport={handleMergeImport}
        onSaveDailySnapshot={handleSaveDailySnapshot}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        adminUser={adminUser}
        stats={stats}
      />


      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'projects' && (
          <ProjectList
            projects={projects}
            estates={estates}
            locations={locations}
            zones={zones}
            categories={categories}
            priorities={priorities}
            onUpdateProgress={handleUpdateProgress}
            onOpenManpowerDrawer={setSelectedDrawerProject}
            onOpenInspector={setSelectedInspectorProject}
            onOpenChecklist={setSelectedChecklistProject}
            onOpenProposals={setSelectedProposalProject}
            onUpdateStatus={handleUpdateStatus}
            onCreateProject={handleCreateProject}
            isCreateModalOpen={isCreateProjectModalOpen}
            setIsCreateModalOpen={setIsCreateProjectModalOpen}
          />
        )}

        {activeTab === 'projects_table' && (
          <ProjectsManagementView
            projects={projects}
            estates={estates}
            locations={locations}
            zones={zones}
            categories={categories}
            priorities={priorities}
            onSaveProject={handleSaveProject}
            onDeleteProject={handleDeleteProject}
            onOpenChecklist={setSelectedChecklistProject}
            onOpenProposals={setSelectedProposalProject}
            onOpenManpower={setSelectedDrawerProject}
            onNewProjectClick={() => setIsCreateProjectModalOpen(true)}
          />
        )}

        {activeTab === 'manpower' && (
          <ManpowerBoardView
            projects={projects}
            employees={employees}
            allocations={allocations}
            estates={estates}
            locations={locations}
            zones={zones}
            onOpenReassignDrawer={setSelectedDrawerProject}
          />
        )}

        {activeTab === 'properties' && (
          <PropertiesView
            estates={estates}
            locations={locations}
            zones={zones}
            onSaveEstate={handleSaveEstate}
            onSaveLocation={handleSaveLocation}
            onSaveZone={handleSaveZone}
            onDeleteEstate={handleDeleteEstate}
            onDeleteLocation={handleDeleteLocation}
            onDeleteZone={handleDeleteZone}
          />
        )}

        {activeTab === 'zones' && (
          <ZonesManagementView
            zones={zones}
            locations={locations}
            estates={estates}
            projects={projects}
            onSaveZone={handleSaveZone}
            onDeleteZone={handleDeleteZone}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesManagementView
            categories={categories}
            projects={projects}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === 'priorities' && (
          <PrioritiesManagementView
            priorities={priorities}
            projects={projects}
            onSavePriority={handleSavePriority}
            onDeletePriority={handleDeletePriority}
          />
        )}

        {activeTab === 'roster' && (
          <RosterView
            employees={employees}
            projects={projects}
            trades={trades}
            onToggleDeployable={handleToggleDeployable}
            onSaveEmployee={handleSaveEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onBulkAddEmployees={handleBulkAddEmployees}
          />
        )}

        {activeTab === 'trades' && (
          <TradesManagementView
            trades={trades}
            employees={employees}
            onSaveTrade={handleSaveTrade}
            onDeleteTrade={handleDeleteTrade}
          />
        )}

        {activeTab === 'quality_gates' && (
          <QualityGateManagementView
            items={qualityGateItems}
            onSaveItem={handleSaveQualityGateItem}
            onDeleteItem={handleDeleteQualityGateItem}
          />
        )}

        {activeTab === 'users' && (
          <UsersManagementView
            users={users}
            onSaveUser={handleSaveUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === 'snapshots' && (
          <SnapshotsView
            snapshots={snapshots}
            onCreateSnapshot={handleCreateSnapshot}
            onRestoreSnapshot={handleRestoreSnapshot}
            onDeleteSnapshot={handleDeleteSnapshot}
            liveStats={{
              totalProjects: projects.length,
              totalWorkers: employees.length,
              totalEstates: estates.length,
              totalUsers: users.length
            }}
          />
        )}
      </main>

      {/* Slide-out Manpower Reassignment Drawer */}
      {selectedDrawerProject && (
        <ReassignmentDrawer
          project={selectedDrawerProject}
          onClose={() => setSelectedDrawerProject(null)}
          employees={employees}
          allocations={allocations}
          trades={trades}
          onAssign={handleAssign}
          onUnassign={handleUnassign}
          onBulkAdd={handleBulkAdd}
        />
      )}

      {/* Slide-out Project Inspector & Notes Drawer */}
      {selectedInspectorProject && (
        <ProjectInspectorDrawer
          project={selectedInspectorProject}
          onClose={() => setSelectedInspectorProject(null)}
          notes={notes}
          onAddNote={handleAddNote}
          onOpenManpower={setSelectedDrawerProject}
          onOpenChecklist={setSelectedChecklistProject}
          onOpenProposals={setSelectedProposalProject}
          estate={inspectorEstate}
          location={inspectorLocation}
          zone={inspectorZone}
          allocations={allocations}
          employees={employees}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Pre-Flight Quality Gate Checklist Modal */}
      {selectedChecklistProject && (
        <PreFlightChecklistModal
          project={selectedChecklistProject}
          onClose={() => setSelectedChecklistProject(null)}
          onSubmitPass={handlePassChecklist}
          qualityGateItems={qualityGateItems}
        />
      )}

      {/* VIP Proposal Options Builder Modal */}
      {selectedProposalProject && (
        <ProposalOptionsModal
          project={selectedProposalProject}
          proposal={proposals.find(p => p.projectId === selectedProposalProject.id)}
          onClose={() => setSelectedProposalProject(null)}
          onSaveProposal={handleSaveProposal}
          onOpenChecklist={() => {
            const pr = selectedProposalProject;
            setSelectedProposalProject(null);
            setSelectedChecklistProject(pr);
          }}
        />
      )}

      {/* Stale Alert Radar Modal */}
      {isStaleRadarOpen && (
        <StaleRadarModal
          projects={projects}
          proposals={proposals}
          estates={estates}
          locations={locations}
          zones={zones}
          onClose={() => setIsStaleRadarOpen(false)}
          onOpenProject={proj => {
            setIsStaleRadarOpen(false);
            setSelectedInspectorProject(proj);
          }}
        />
      )}

      {/* VIP Executive Daily Report Deck Modal */}
      {isDailyReportOpen && (
        <ExecutiveDailyDigestModal
          projects={projects}
          estates={estates}
          locations={locations}
          zones={zones}
          allocations={allocations}
          onClose={() => setIsDailyReportOpen(false)}
        />
      )}

      {/* Vault Security & E2EE Protocol Modal */}
      {isVaultSecurityOpen && (
        <VaultSecurityModal
          onClose={() => setIsVaultSecurityOpen(false)}
          employeeCount={employees.length}
        />
      )}

      {/* Enhanced Lock & Sign Out Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
      />

      {/* Universal Theme-Aware Alert & Confirm Dialog System */}
      <ConfirmDialogContainer />

      {/* PWA Mobile Installation Prompt Banner */}
      <PwaInstallPrompt />
    </div>
  );
};

export default App;
