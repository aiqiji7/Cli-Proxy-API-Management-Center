import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconLoader2, IconPlus, IconX } from '@/components/ui/icons';
import type { ModelInfo } from '@/utils/models';
import styles from './sharedForm.module.scss';

interface ModelSyncPanelProps {
  loading: boolean;
  error: string | null;
  upstreamModels: ModelInfo[];
  currentModelNames: Set<string>;
  hasFetched: boolean;
  mutating?: boolean;
  onConfirm: (upstreamModels: ModelInfo[]) => void;
  onCancel: () => void;
  onReload: () => void;
}

export function ModelSyncPanel({
  loading,
  error,
  upstreamModels,
  currentModelNames,
  hasFetched,
  mutating,
  onConfirm,
  onCancel,
  onReload,
}: ModelSyncPanelProps) {
  const { t } = useTranslation();

  const diff = useMemo(() => {
    const upstreamNames = new Set(
      upstreamModels.map((m) => m.name.trim()).filter(Boolean)
    );

    const toAdd = upstreamModels.filter(
      (m) => m.name.trim() && !currentModelNames.has(m.name.trim())
    );
    const toRemove: string[] = [];
    currentModelNames.forEach((name) => {
      if (!upstreamNames.has(name)) {
        toRemove.push(name);
      }
    });
    const unchangedCount = upstreamModels.filter(
      (m) => m.name.trim() && currentModelNames.has(m.name.trim())
    ).length;

    return { toAdd, toRemove, unchangedCount };
  }, [upstreamModels, currentModelNames]);

  const hasChanges = diff.toAdd.length > 0 || diff.toRemove.length > 0;

  return (
    <div className={styles.syncPanel}>
      {loading ? (
        <div className={styles.syncLoading}>
          <span className={`${styles.statusIcon} ${styles.statusIconLoading}`}>
            <IconLoader2 size={14} />
          </span>
          <span>{t('providersPage.sync.loading')}</span>
        </div>
      ) : error ? (
        <div className={styles.connectivityError}>{error}</div>
      ) : hasFetched && !hasChanges ? (
        <div className={styles.syncEmpty}>
          {t('providersPage.sync.noChanges')}
        </div>
      ) : hasFetched ? (
        <>
          <div className={styles.syncSummary}>
            {diff.toAdd.length > 0 && (
              <span className={styles.syncAddCount}>
                <IconPlus size={12} />
                {t('providersPage.sync.toAdd', { count: diff.toAdd.length })}
              </span>
            )}
            {diff.toRemove.length > 0 && (
              <span className={styles.syncRemoveCount}>
                <IconX size={12} />
                {t('providersPage.sync.toRemove', { count: diff.toRemove.length })}
              </span>
            )}
            {diff.unchangedCount > 0 && (
              <span className={styles.syncUnchangedCount}>
                {t('providersPage.sync.unchanged', { count: diff.unchangedCount })}
              </span>
            )}
          </div>

          {diff.toAdd.length > 0 && (
            <div className={styles.syncSection}>
              <div className={styles.syncSectionTitle}>
                {t('providersPage.sync.willAdd')}
              </div>
              <ul className={styles.syncList}>
                {diff.toAdd.map((m) => (
                  <li key={m.name} className={`${styles.syncItem} ${styles.syncItemAdd}`}>
                    <IconPlus size={10} />
                    <span className={styles.syncName}>{m.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {diff.toRemove.length > 0 && (
            <div className={styles.syncSection}>
              <div className={`${styles.syncSectionTitle} ${styles.syncSectionTitleRemove}`}>
                {t('providersPage.sync.willRemove')}
              </div>
              <ul className={styles.syncList}>
                {diff.toRemove.map((name) => (
                  <li key={name} className={`${styles.syncItem} ${styles.syncItemRemove}`}>
                    <IconX size={10} />
                    <span className={styles.syncName}>{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className={styles.syncEmpty}>
          {t('providersPage.sync.notLoaded')}
        </div>
      )}

      <div className={styles.syncFooter}>
        <button
          type="button"
          className={styles.connectivityBtnGhost}
          onClick={onCancel}
          disabled={mutating}
        >
          {t('providersPage.sync.cancel')}
        </button>
        {hasFetched && !loading && !error ? (
          <button
            type="button"
            className={styles.connectivityBtnGhost}
            onClick={onReload}
            disabled={loading}
          >
            {t('providersPage.sync.reload')}
          </button>
        ) : null}
        {hasFetched && hasChanges && !loading ? (
          <button
            type="button"
            className={styles.syncConfirmBtn}
            onClick={() => onConfirm(upstreamModels)}
            disabled={mutating}
          >
            {t('providersPage.sync.confirm')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
