import { useState } from "react";
import {
  normalizeName,
  readProfileName,
  writeProfileName,
} from "../lib/profile";

export function useProfile() {
  const [name, setName] = useState(readProfileName);

  const saveName = (value) => {
    const next = normalizeName(value);
    writeProfileName(next);
    setName(next);
    return next;
  };

  return { name, saveName };
}
