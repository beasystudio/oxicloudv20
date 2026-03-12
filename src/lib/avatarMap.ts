/**
 * Avatar map — maps user emails to their B&W profile photos
 */
import janAvatar from '@/assets/avatars/jan-vermeersch.jpg';
import mariaAvatar from '@/assets/avatars/maria-peeters.jpg';
import lisaAvatar from '@/assets/avatars/lisa-desmet.jpg';
import thomasAvatar from '@/assets/avatars/thomas-janssen.jpg';
import emmaAvatar from '@/assets/avatars/emma-vandamme.jpg';
import pieterAvatar from '@/assets/avatars/pieter-maes.jpg';
import karelAvatar from '@/assets/avatars/karel-wouters.jpg';
import sophieAvatar from '@/assets/avatars/sophie-hendricks.jpg';
import bartAvatar from '@/assets/avatars/bart-claes.jpg';
import koenAvatar from '@/assets/avatars/koen-vandenberg.jpg';
import paulAvatar from '@/assets/avatars/paul-gijsemans.jpg';
import christineAvatar from '@/assets/avatars/christine-duong.jpg';

const EMAIL_TO_AVATAR: Record<string, string> = {
  'paul@oxicloud.com': paulAvatar,
  'christine@oxicloud.com': christineAvatar,
  'jan@gdesign.be': janAvatar,
  'maria@gdesign.be': mariaAvatar,
  'lisa@gdesign.be': lisaAvatar,
  'thomas@gdesign.be': thomasAvatar,
  'emma@gdesign.be': emmaAvatar,
  'pieter@gdesign.be': pieterAvatar,
  'karel@4takt.be': karelAvatar,
  'sophie@4takt.be': sophieAvatar,
  'bart@4takt.be': bartAvatar,
  'koen@antwerpen.be': koenAvatar,
};

const NAME_TO_AVATAR: Record<string, string> = {
  'Paul Gijsemans': paulAvatar,
  'Christine Duong': christineAvatar,
  'Jan Vermeersch': janAvatar,
  'Maria Peeters': mariaAvatar,
  'Lisa De Smet': lisaAvatar,
  'Thomas Janssen': thomasAvatar,
  'Emma Van Damme': emmaAvatar,
  'Pieter Maes': pieterAvatar,
  'Karel Wouters': karelAvatar,
  'Sophie Hendricks': sophieAvatar,
  'Bart Claes': bartAvatar,
  'Koen Van den Berg': koenAvatar,
};

const ID_TO_AVATAR: Record<string, string> = {
  'gd-1': janAvatar,
  'gd-2': mariaAvatar,
  'gd-3': lisaAvatar,
  'gd-4': thomasAvatar,
  'gd-5': emmaAvatar,
  'gd-6': pieterAvatar,
  '4t-1': karelAvatar,
  '4t-2': sophieAvatar,
  '4t-3': bartAvatar,
};

export function getAvatarByEmail(email: string): string | undefined {
  return EMAIL_TO_AVATAR[email.toLowerCase()];
}

export function getAvatarByName(name: string): string | undefined {
  return NAME_TO_AVATAR[name];
}

export function getAvatarById(id: string): string | undefined {
  return ID_TO_AVATAR[id];
}

export function getAvatarUrl(opts: { email?: string; name?: string; id?: string }): string | undefined {
  if (opts.email) {
    const av = getAvatarByEmail(opts.email);
    if (av) return av;
  }
  if (opts.name) {
    const av = getAvatarByName(opts.name);
    if (av) return av;
  }
  if (opts.id) {
    const av = getAvatarById(opts.id);
    if (av) return av;
  }
  return undefined;
}
