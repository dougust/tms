'use client';

import { useHealthControllerGetHealth } from '@dougust/clients';
import { Button } from '@dougust/ui';

export default function Index() {
  const health = useHealthControllerGetHealth();
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.tailwind file.
   */
  return (
    <div>
      <div className="wrapper">
        <div className="container">
          <div id="welcome">
            <h1>
              {health.status}
              {JSON.stringify(health.data)}
              <span> Hello there, </span>
              Welcome fe 👋
            </h1>
          </div>

          <Button>Button</Button>

        </div>
      </div>
    </div>
  );
}
