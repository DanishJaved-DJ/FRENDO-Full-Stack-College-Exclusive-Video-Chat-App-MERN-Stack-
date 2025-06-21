// src/components/MatchModal.jsx
import React from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

const MatchModal = ({ match, onAccept, onDecline }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onDecline(); // Auto-decline if user closes modal
  };

  if (!match || !isOpen) return null;

  const { user } = match;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <Dialog.Panel className="relative bg-white p-6 rounded-xl shadow-xl max-w-sm w-full z-50">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
          onClick={handleClose}
        >
          <X />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <img
            src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.userId}`}
            alt={user.username}
            className="w-20 h-20 rounded-full object-cover"
          />
          <h2 className="text-xl font-semibold">Matched with {user.username}</h2>
          <p className="text-gray-600 text-sm">Do you want to start a chat?</p>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => {
                onAccept();
                setIsOpen(false);
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Accept
            </button>
            <button
              onClick={() => {
                onDecline();
                setIsOpen(false);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Decline
            </button>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default MatchModal;
