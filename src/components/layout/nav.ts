export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export const navItems: NavItem[] = [
  { label: "בית", href: "#home" },
  { label: "הופעות", href: "#upcoming-show" },
  { label: "מוזיקה", href: "#music" },
  {
    label: "מרץ׳",
    href: "https://www.merchadvice.com/artist/%D7%A9%D7%90%D7%96%D7%90%D7%9E%D7%90%D7%98/",
    external: true,
  },
];
