export type CheckMode =
  | "verify"
  | "match"
  | "token"
  | "link"
  | "wallet"
  | "sign_guard";

export interface SavedReport {
  id: string;
  mode: CheckMode;
  network: string;
  title: string;
  searchText: string;
  createdAt: string;
  response: Record<string, unknown>;
}

const DB_NAME = "safesign-local";
const DB_VERSION = 1;
const STORE_NAME = "reports";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });

        store.createIndex("createdAt", "createdAt");
        store.createIndex("network", "network");
        store.createIndex("mode", "mode");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveReport(
  report: SavedReport,
): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put(report);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

export async function getReports(): Promise<SavedReport[]> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).getAll();

    request.onsuccess = () => {
      const reports = request.result as SavedReport[];

      reports.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );

      database.close();
      resolve(reports);
    };

    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

export async function getReport(
  id: string,
): Promise<SavedReport | undefined> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(id);

    request.onsuccess = () => {
      database.close();
      resolve(request.result as SavedReport | undefined);
    };

    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

export async function deleteReport(id: string): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).delete(id);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
                          }
