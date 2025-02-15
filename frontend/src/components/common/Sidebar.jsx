import XSvg from "../svgs/X";
import axios from "axios";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Sidebar = () => {

	const queryClient = useQueryClient();
	const { mutate: logout } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/auth/logout", {
					method: "POST",
				})
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				// console.log(data);
				// return data;
			} catch (error) {
				console.error(error);
				throw error;
			}
		},
		onSuccess: () => {
			toast.success("Logout is successful");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
		onError: () => {
			toast.error("Logout failed")
		}
	});
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });


	const { mutateAsync: createOrder } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/payment/subscription", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userId: authUser._id,
						amount: 99900
					}),
				})
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				console.log("myspace", data);
				return data;
			} catch (error) {
				console.error(error);
				throw error;
			}
		}
	});
	const checkoutHandler = async (amount) => {
		if (!authUser?._id) {
			console.error("User ID is undefined");
			return;
		}

		const key = "rzp_test_INGOgWrMbkWmMi"; // Fetch API key

		const order = await createOrder();
		console.log("keyyyyyy", key, "order", order)
		const options = {
			key: key,
			amount: 99900,
			currency: "INR",
			name: "AT Social Media subscription",
			description: "Year subscription",
			image: "https://www.istockphoto.com/photo/data-patterns-emerging-over-europe-dark-blue-analyzing-global-data-flow-business-gm2070763900-564565598",
			order_id: order?.id,
			callback_url: `http://localhost:5000/api/payment/paymentverification?userId=${authUser?._id}`,
			prefill: {
				name: authUser?.username,
				email: authUser?.email,
				contact: "9999999999"
			},
			notes: {
				"address": "Razorpay Corporate Office",
				"userId": authUser?._id
			},
			theme: {
				"color": "#121212"
			}
		};
		const razor = new window.Razorpay(options);
		razor.open();
	}
	const { data: isSubscribed } = useQuery({
		queryKey: ["checkPayment", authUser?._id], // Unique cache key
		queryFn: async () => {
			if (!authUser?._id) return false; // Avoid API call if user is not logged in
			const res = await fetch(`/api/payment/check-payment?userId=${authUser._id}`);
			console.log(res);
			if (!res.ok) throw new Error("Failed to check subscription status");
			const data = await res.json();
			return data.isSubscribed; // Assuming backend returns { isSubscribed: true/false }
		}
	});
	return (
		<div className='md:flex-[2_2_0] w-18 max-w-52'>
			<div className='sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full'>
				<Link to='/' className='flex justify-center md:justify-start'>
					<XSvg className='px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900' />
				</Link>
				<ul className='flex flex-col gap-3 mt-4'>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/'
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<MdHomeFilled className='w-8 h-8' />
							<span className='text-lg hidden md:block'>Home</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/notifications'
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<IoNotifications className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Notifications</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start'>
						<Link
							to={`/profile/${authUser?.username}`}
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<FaUser className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Profile</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start'>
						{!isSubscribed && (<Link
							onClick={checkoutHandler}
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<span className='text-lg hidden md:block'>Buy Subscription</span>
						</Link>)}
						{isSubscribed && (<Link
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<span className='text-lg hidden md:block text-green-500'>Subscribed</span>
						</Link>)}
					</li>
				</ul>
				{authUser && (
					<Link
						to={`/profile/${authUser.username}`}
						className='mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full'
					>
						<div className='avatar hidden md:inline-flex'>
							<div className='w-8 rounded-full'>
								<img src={authUser?.profileImg || "/avatar-placeholder.png"} />
							</div>
						</div>
						<div className='flex justify-between flex-1'>
							<div className='hidden md:block'>
								<p className='text-white font-bold text-sm w-20 truncate'>{authUser?.fullName}</p>
								<p className='text-slate-500 text-sm'>@{authUser?.username}</p>
							</div>
							<BiLogOut className='w-5 h-5 cursor-pointer'
								onClick={(e) => {
									e.preventDefault();
									logout();
								}}
							/>
						</div>
					</Link>
				)}
			</div>
		</div>
	);
};
export default Sidebar;