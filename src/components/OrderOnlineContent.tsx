import type { ReactElement } from "react";

import OrderOnlineSection from "@/components/OrderOnlineSection";

export default function OrderOnlineContent(): ReactElement {
  return (
    <main id="main-content">
      <OrderOnlineSection headingLevel={1} />
    </main>
  );
}
