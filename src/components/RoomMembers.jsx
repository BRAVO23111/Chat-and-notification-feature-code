import React, { useState, useEffect } from 'react';
import { FiUsers, FiX, FiMail, FiUser } from 'react-icons/fi';
import { db } from '../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const RoomMembers = ({ room }) => {
  const [showMembers, setShowMembers] = useState(false);
  const [memberDetails, setMemberDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (!showMembers) return;

      setLoading(true);
      try {
        const roomRef = doc(db, "rooms", room.id);
        const roomSnap = await getDoc(roomRef);

        if (roomSnap.exists()) {
          const roomData = roomSnap.data();
          const creatorInfo = {
            id: roomData.creatorId,
            email: roomData.creatorEmail,
            isCreator: true
          };

          const allMembers = [
            creatorInfo,
            ...roomData.members
              .filter(memberId => memberId !== roomData.creatorId)
              .map(memberId => ({
                id: memberId,
                isCreator: false
              }))
          ];

          setMemberDetails(allMembers);
        }
      } catch (error) {
        console.error("Error fetching member details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [showMembers, room.id]);

  return (
    <>
      <button
        onClick={() => setShowMembers(true)}
        className="flex items-center space-x-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 transition duration-300"
      >
        <FiUsers size={20} />
        <span className="font-medium">Members ({room.members?.length || 0})</span>
      </button>

      <AnimatePresence>
        {showMembers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Room Members</h2>
                <button
                  onClick={() => setShowMembers(false)}
                  className="text-gray-500 hover:text-gray-700 transition duration-300"
                >
                  <FiX size={24} />
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <motion.div
                  className="space-y-2"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                >
                  {memberDetails.map((member, index) => (
                    <motion.div
                      key={member.id + index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -10, opacity: 0 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <FiUser className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-800 font-semibold">
                            {member.email || 'Unknown User'}
                          </p>
                          {member.isCreator && (
                            <span className="text-xs text-blue-500 font-medium">
                              Room Creator
                            </span>
                          )}
                        </div>
                      </div>
                      <FiMail className="text-gray-400" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RoomMembers;
