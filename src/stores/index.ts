import { AikatauluStore } from './aikataulu';
import { Kayttajat } from './kayttaja';
import { MuokkaustietoStore } from './muokkaustieto';
import { OpetussuunnitelmaStore } from './opetussuunnitelma';
import { TermitStore } from './TermitStore';

const kayttajaStore = Kayttajat;
const opetussuunnitelmaStore = new OpetussuunnitelmaStore();
const aikatauluStore = new AikatauluStore();
const muokkaustietoStore = new MuokkaustietoStore();
const termitStore = new TermitStore();

export const stores = Object.freeze({
  kayttajaStore,
  opetussuunnitelmaStore,
  aikatauluStore,
  muokkaustietoStore,
  termitStore,
});
