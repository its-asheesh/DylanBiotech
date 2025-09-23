// src/components/auth/AuthRedirectLink.tsx
import { Box, Typography, Link as MuiLink } from "@mui/material";

interface AuthRedirectLinkProps {
  text: string;
  href: string;
  linkText: string;
}

export const AuthRedirectLink: React.FC<AuthRedirectLinkProps> = ({
  text,
  href,
  linkText,
}) => (
  <Box sx={{ textAlign: "center", mt: 3 }}>
    <Typography variant="body2" color="text.secondary">
      {text}{" "}
      <MuiLink
        href={href}
        variant="body2"
        sx={{
          color: "primary.main",
          textDecoration: "none",
          fontWeight: "bold",
          "&:hover": {
            textDecoration: "underline",
          },
        }}
      >
        {linkText}
      </MuiLink>
    </Typography>
  </Box>
);