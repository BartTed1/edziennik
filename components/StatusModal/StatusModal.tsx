import "./StatusModal.sass"
import {useEffect, useState} from "react";

interface StatusModalProps {
	isVisible: boolean;
	setIsVisible: (value: boolean) => void;
	message: string;
	status: 'success' | 'error';
}

function StatusModal({ isVisible, setIsVisible, message, status } : StatusModalProps) {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		if (isVisible) {
			const interval = setInterval(() => {
				setProgress(progress => {
					if (progress >= 1) {
						clearInterval(interval);
						setIsVisible(false);
						setProgress(0)
						return 0;
					}
					return progress + 0.0034;
				});
			}, 17);
			return () => clearInterval(interval);
		}
	}, [isVisible]);

	return (
		<div className={`status-modal ${!isVisible && "status-modal--hidden"}`}>
			{
				status === 'success' ?
					<svg width="24" height="19" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M6.00039 11.2L1.80039 7.00001L0.400391 8.40001L6.00039 14L18.0004 2.00001L16.6004 0.600006L6.00039 11.2Z"
							fill="#67CBABFF"/>
					</svg>
					:
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M12 0C5.373 0 0 5.373 0 12C0 18.627 5.373 24 12 24C18.627 24 24 18.627 24 12C24 5.373 18.627 0 12 0ZM12 22C6.486 22 2 17.514 2 12C2 6.486 6.486 2 12 2C17.514 2 22 6.486 22 12C22 17.514 17.514 22 12 22ZM12 5C11.4477 5 11 5.44772 11 6V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V6C13 5.44772 12.5523 5 12 5ZM12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18Z"
							fill="#FE6D73FF"/>
					</svg>
			}
			{message}
			<progress value={progress} data-status={status}/>
		</div>
	)
}

export default StatusModal;