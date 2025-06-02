
// src/components/dashboard/threshold-settings-modal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { CustomAlertSettings } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ThresholdSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsSave: (settings: CustomAlertSettings) => void;
  initialSettings: CustomAlertSettings;
}

const LS_KEY_CUSTOM_THRESHOLDS = 'breatheEasyCustomAlertThresholds';

export default function ThresholdSettingsModal({
  isOpen,
  onOpenChange,
  onSettingsSave,
  initialSettings,
}: ThresholdSettingsModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [coThreshold, setCoThreshold] = useState(initialSettings.co?.threshold?.toString() || '');
  const [coEnabled, setCoEnabled] = useState(initialSettings.co?.enabled ?? true);
  const [pm25Threshold, setPm25Threshold] = useState(initialSettings.pm2_5?.threshold?.toString() || '');
  const [pm25Enabled, setPm25Enabled] = useState(initialSettings.pm2_5?.enabled ?? true);

  useEffect(() => {
    setCoThreshold(initialSettings.co?.threshold?.toString() || '');
    setCoEnabled(initialSettings.co?.enabled ?? true);
    setPm25Threshold(initialSettings.pm2_5?.threshold?.toString() || '');
    setPm25Enabled(initialSettings.pm2_5?.enabled ?? true);
  }, [initialSettings, isOpen]);


  const handleSave = () => {
    const newSettings: CustomAlertSettings = {};
    const coVal = parseFloat(coThreshold);
    const pm25Val = parseFloat(pm25Threshold);

    if (!isNaN(coVal) && coVal >= 0) {
      newSettings.co = { threshold: coVal, enabled: coEnabled, unit: 'ppm' };
    } else if (coThreshold !== '') {
      toast({ variant: 'destructive', title: t('invalidThresholdTitle'), description: t('invalidCOThresholdValue') });
      return;
    }

    if (!isNaN(pm25Val) && pm25Val >= 0) {
      newSettings.pm2_5 = { threshold: pm25Val, enabled: pm25Enabled, unit: 'µg/m³' };
    } else if (pm25Threshold !== '') {
      toast({ variant: 'destructive', title: t('invalidThresholdTitle'), description: t('invalidPM25ThresholdValue') });
      return;
    }
    
    onSettingsSave(newSettings);
    toast({ title: t('settingsSavedTitle'), description: t('alertThresholdsUpdated') });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t('customAlertThresholdsTitle')}</DialogTitle>
          <DialogDescription>
            {t('customAlertThresholdsDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* CO Threshold Setting */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="co-threshold" className="col-span-2">{t('coThresholdLabel')} (ppm)</Label>
            <Input
              id="co-threshold"
              type="number"
              value={coThreshold}
              onChange={(e) => setCoThreshold(e.target.value)}
              placeholder={t('egValue', { value: "4.0" })}
              className="col-span-1"
              min="0"
            />
            <Switch
              id="co-enabled"
              checked={coEnabled}
              onCheckedChange={setCoEnabled}
              aria-label={t('enableCOAlerts')}
              className="col-span-1 justify-self-end"
            />
          </div>

          {/* PM2.5 Threshold Setting */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pm25-threshold" className="col-span-2">{t('pm25ThresholdLabel')} (µg/m³)</Label>
            <Input
              id="pm25-threshold"
              type="number"
              value={pm25Threshold}
              onChange={(e) => setPm25Threshold(e.target.value)}
              placeholder={t('egValue', { value: "12.0" })}
              className="col-span-1"
              min="0"
            />
            <Switch
              id="pm25-enabled"
              checked={pm25Enabled}
              onCheckedChange={setPm25Enabled}
              aria-label={t('enablePM25Alerts')}
              className="col-span-1 justify-self-end"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button onClick={handleSave}>{t('saveChanges')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
