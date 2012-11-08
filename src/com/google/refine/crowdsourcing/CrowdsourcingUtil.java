package com.google.refine.crowdsourcing;

import com.google.refine.ProjectManager;
import com.google.refine.preference.PreferenceStore;


public final class CrowdsourcingUtil {

    public static Object getPreference(String prefName) {
        PreferenceStore ps = ProjectManager.singleton.getPreferenceStore();
        Object pref = ps.get(prefName);
        
        return pref;
    }

    
}
