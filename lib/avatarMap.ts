/**
 * Avatar map - maps user emails to their B&W profile photos
 */
import janAvatar from '@/assets/avatars/jan-vermeersch.jpg';
import thomasAvatar from '@/assets/avatars/thomas-janssen.jpg';
import emmaAvatar from '@/assets/avatars/emma-vandamme.jpg';
import pieterAvatar from '@/assets/avatars/pieter-maes.jpg';

const EMAIL_TO_AVATAR: Record<string, string> = {
  'jan@gdesign.be': janAvatar,
  'thomas@gdesign.be': thomasAvatar,
  'emma@gdesign.be': emmaAvatar,
  'pieter@gdesign.be': pieterAvatar,
};

const NAME_TO_AVATAR: Record<string, string> = {
  'Jan Vermeersch': janAvatar,
  'Thomas Janssen': thomasAvatar,
  'Emma Van Damme': emmaAvatar,
  'Pieter Maes': pieterAvatar,
};

const ID_TO_AVATAR: Record<string, string> = {
  'gd-1': janAvatar,
  'gd-4': thomasAvatar,
  'gd-5': emmaAvatar,
  'gd-6': pieterAvatar,
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
