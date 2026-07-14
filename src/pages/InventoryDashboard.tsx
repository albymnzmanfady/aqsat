"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { api, ApiProduct, ApiInventoryTransaction } from "@/lib/api";
import { showError } from "@/utils/toast";
import {
  Package,
  ArrowDownUp,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Warehouse,
  DollarSign,
  BarChart3,
  PieChart,
  Layers,
  Loader2,
  Box,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";

// ... (remainder of the file stays exactly as in the original – only the import block changed)