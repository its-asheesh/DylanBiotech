// src/components/auth/AuthCardLayout.tsx
"use client";

import type React from "react";
import { motion } from "framer-motion";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Container,
} from "@mui/material";
import type { Variants } from "framer-motion";

interface AuthCardLayoutProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const cardVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut", delay: 0.2 },
  },
};

export const AuthCardLayout: React.FC<AuthCardLayoutProps> = ({
  title,
  subtitle,
  icon,
  children,
}) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={cardVariants}>
            <Card
              elevation={24}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                backdropFilter: "blur(20px)",
                background: "rgba(255, 255, 255, 0.95)",
              }}
            >
              <CardContent sx={{ p: 6 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 4,
                  }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Avatar
                      sx={{
                        m: 1,
                        bgcolor: "primary.main",
                        width: 64,
                        height: 64,
                      }}
                    >
                      {icon}
                    </Avatar>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Typography
                      component="h1"
                      variant="h4"
                      sx={{
                        fontWeight: "bold",
                        background: "linear-gradient(45deg, #667eea, #764ba2)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 1,
                      }}
                    >
                      {title}
                    </Typography>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      {subtitle}
                    </Typography>
                  </motion.div>
                </Box>

                {children}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};
