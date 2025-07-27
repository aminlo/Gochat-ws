import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../utils/usercontext';

const WSChat = () => {
    const { hubId } = useParams();
    const navigate = useNavigate();
    const { user, loading } = useUser();
}