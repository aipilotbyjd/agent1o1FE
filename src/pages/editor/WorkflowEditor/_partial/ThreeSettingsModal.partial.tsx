import { FC } from 'react';
import Modal, { ModalBody, ModalHeader } from '@/components/ui/Modal';
import Label from '@/components/form/Label';
import Checkbox from '@/components/form/Checkbox';
import Select from '@/components/form/Select';
import Button from '@/components/ui/Button';
import { useThreeContextSafe } from '../_three/ThreeProvider';
import { QualityPreset } from '../_three/utils/performanceUtils';

interface IThreeSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const qualityOptions = [
	{ value: 'low', label: 'Low (Best Performance)' },
	{ value: 'medium', label: 'Medium (Balanced)' },
	{ value: 'high', label: 'High (Better Quality)' },
	{ value: 'ultra', label: 'Ultra (Maximum Quality)' },
];

const ThreeSettingsModalPartial: FC<IThreeSettingsModalProps> = ({ isOpen, onClose }) => {
	const setIsOpen = (val: boolean | ((prev: boolean) => boolean)) => {
		if (typeof val === 'function' ? !val(isOpen) : !val) {
			onClose();
		}
	};
	const threeContext = useThreeContextSafe();

	if (!threeContext) {
		return null;
	}

	const {
		settings,
		setQuality,
		toggleEnabled,
		updateBackgroundEffects,
		updateNodeEffects,
		updateExecutionEffects,
		updateAdvanced,
		resetToDefaults,
	} = threeContext;

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen}>
			<ModalHeader>Visual Effects Settings</ModalHeader>
			<ModalBody>
				<div className='space-y-6'>
					{/* Master Toggle */}
					<div className='flex items-center justify-between rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800'>
						<div>
							<Label htmlFor='threeEnabled' className='mb-0 text-base font-semibold'>
								Enable 3D Visual Effects
							</Label>
							<p className='text-sm text-zinc-500'>
								Toggle all Three.js visual enhancements
							</p>
						</div>
						<Checkbox
							id='threeEnabled'
							name='threeEnabled'
							checked={settings.enabled}
							onChange={toggleEnabled}
						/>
					</div>

					{settings.enabled && (
						<>
							{/* Quality Preset */}
							<div>
								<Label htmlFor='qualityPreset' className='mb-2'>
									Quality Preset
								</Label>
								<Select
									id='qualityPreset'
									name='qualityPreset'
									value={settings.quality}
									onChange={(e) => setQuality(e.target.value as QualityPreset)}>
									{qualityOptions.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</Select>
								<p className='mt-1 text-xs text-zinc-500'>
									Higher quality uses more GPU resources
								</p>
							</div>

							{/* Background Effects */}
							<div>
								<h4 className='mb-3 text-sm font-semibold text-zinc-400 uppercase'>
									Background Effects
								</h4>
								<div className='space-y-3'>
									<div className='flex items-center justify-between'>
										<Label htmlFor='animatedGrid' className='mb-0'>
											Animated Grid
										</Label>
										<Checkbox
											id='animatedGrid'
											name='animatedGrid'
											checked={settings.backgroundEffects.animatedGrid}
											onChange={(e) =>
												updateBackgroundEffects({
													animatedGrid: e.target.checked,
												})
											}
										/>
									</div>
									<div className='flex items-center justify-between'>
										<Label htmlFor='ambientParticles' className='mb-0'>
											Ambient Particles
										</Label>
										<Checkbox
											id='ambientParticles'
											name='ambientParticles'
											checked={settings.backgroundEffects.ambientParticles}
											onChange={(e) =>
												updateBackgroundEffects({
													ambientParticles: e.target.checked,
												})
											}
										/>
									</div>
									<div className='flex items-center justify-between'>
										<Label htmlFor='backgroundGradient' className='mb-0'>
											Background Gradient
										</Label>
										<Checkbox
											id='backgroundGradient'
											name='backgroundGradient'
											checked={settings.backgroundEffects.backgroundGradient}
											onChange={(e) =>
												updateBackgroundEffects({
													backgroundGradient: e.target.checked,
												})
											}
										/>
									</div>
								</div>
							</div>

							{/* Node Effects */}
							<div>
								<h4 className='mb-3 text-sm font-semibold text-zinc-400 uppercase'>
									Node Effects
								</h4>
								<div className='space-y-3'>
									<div className='flex items-center justify-between'>
										<Label htmlFor='glowHalos' className='mb-0'>
											Glow Halos
										</Label>
										<Checkbox
											id='glowHalos'
											name='glowHalos'
											checked={settings.nodeEffects.glowHalos}
											onChange={(e) =>
												updateNodeEffects({
													glowHalos: e.target.checked,
												})
											}
										/>
									</div>
									<div className='flex items-center justify-between'>
										<Label htmlFor='connectionBeams' className='mb-0'>
											Connection Beams
										</Label>
										<Checkbox
											id='connectionBeams'
											name='connectionBeams'
											checked={settings.nodeEffects.connectionBeams}
											onChange={(e) =>
												updateNodeEffects({
													connectionBeams: e.target.checked,
												})
											}
										/>
									</div>
								</div>
							</div>

							{/* Execution Effects */}
							<div>
								<h4 className='mb-3 text-sm font-semibold text-zinc-400 uppercase'>
									Execution Effects
								</h4>
								<div className='space-y-3'>
									<div className='flex items-center justify-between'>
										<Label htmlFor='dataFlowAnimation' className='mb-0'>
											Data Flow Animation
										</Label>
										<Checkbox
											id='dataFlowAnimation'
											name='dataFlowAnimation'
											checked={settings.executionEffects.dataFlowAnimation}
											onChange={(e) =>
												updateExecutionEffects({
													dataFlowAnimation: e.target.checked,
												})
											}
										/>
									</div>
									<div className='flex items-center justify-between'>
										<Label htmlFor='statusParticles' className='mb-0'>
											Status Particles
										</Label>
										<Checkbox
											id='statusParticles'
											name='statusParticles'
											checked={settings.executionEffects.statusParticles}
											onChange={(e) =>
												updateExecutionEffects({
													statusParticles: e.target.checked,
												})
											}
										/>
									</div>
								</div>
							</div>

							{/* Advanced */}
							<div>
								<h4 className='mb-3 text-sm font-semibold text-zinc-400 uppercase'>
									Advanced Effects
								</h4>
								<div className='space-y-3'>
									<div className='flex items-center justify-between'>
										<Label htmlFor='bloom' className='mb-0'>
											Bloom (Glow)
										</Label>
										<Checkbox
											id='bloom'
											name='bloom'
											checked={settings.advanced.bloom}
											onChange={(e) =>
												updateAdvanced({
													bloom: e.target.checked,
												})
											}
										/>
									</div>
									<div className='flex items-center justify-between'>
										<Label htmlFor='motionBlur' className='mb-0'>
											Motion Blur
										</Label>
										<Checkbox
											id='motionBlur'
											name='motionBlur'
											checked={settings.advanced.motionBlur}
											onChange={(e) =>
												updateAdvanced({
													motionBlur: e.target.checked,
												})
											}
										/>
									</div>
									<div className='flex items-center justify-between'>
										<Label htmlFor='depthOfField' className='mb-0'>
											Depth of Field
										</Label>
										<Checkbox
											id='depthOfField'
											name='depthOfField'
											checked={settings.advanced.depthOfField}
											onChange={(e) =>
												updateAdvanced({
													depthOfField: e.target.checked,
												})
											}
										/>
									</div>
								</div>
							</div>

							{/* Reset Button */}
							<div className='border-t border-zinc-200 pt-4 dark:border-zinc-700'>
								<Button
									variant='outline'
									color='zinc'
									onClick={resetToDefaults}
									className='w-full'>
									Reset to Defaults
								</Button>
							</div>
						</>
					)}
				</div>
			</ModalBody>
		</Modal>
	);
};

export default ThreeSettingsModalPartial;
